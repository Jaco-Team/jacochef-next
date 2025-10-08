/**
 * jscodeshift transform: migrate <Grid item xs={..} sm={..}> -> <Grid size={{ xs: .., sm: .. }} ...>
 *
 * Usage (dry-run):
 *   npx jscodeshift -t migrate-grid-size.js src --extensions=js,jsx,ts,tsx -d -p
 *
 * Apply (no dry-run):
 *   npx jscodeshift -t migrate-grid-size.js src --extensions=js,jsx,ts,tsx
 */

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // names of breakpoint props we want to collect
  const bpNames = new Set(['xs','sm','md','lg','xl']);

  // match JSXElements where opening element name is Grid (JSXIdentifier)
  root.find(j.JSXElement, {
    openingElement: { name: { type: 'JSXIdentifier', name: 'Grid' } }
  }).forEach(path => {
    const opening = path.node.openingElement;
    const attrs = opening.attributes || [];

    // if there's already a `size` attribute, skip
    if (attrs.some(a => a && a.type === 'JSXAttribute' && a.name && a.name.name === 'size')) {
      return;
    }

    const remaining = [];
    const sizeProps = [];

    attrs.forEach(attr => {
      if (!attr || attr.type !== 'JSXAttribute') {
        remaining.push(attr);
        return;
      }

      const name = attr.name && attr.name.name;
      if (name === 'item') {
        // drop `item`
        return;
      }

      if (bpNames.has(name)) {
        // collect value expression
        if (!attr.value) return; // weird boolean attr — skip
        let valExpr = null;
        if (attr.value.type === 'JSXExpressionContainer') {
          valExpr = attr.value.expression;
        } else {
          // string literal like xs="12"
          valExpr = j.literal(attr.value.value);
        }
        // property key as identifier (xs, sm, ...)
        sizeProps.push(j.property('init', j.identifier(name), valExpr));
        return;
      }

      // keep any other attrs (sx, className, spacing, etc.)
      remaining.push(attr);
    });

    if (sizeProps.length) {
      const obj = j.objectExpression(sizeProps);
      const sizeAttr = j.jsxAttribute(
        j.jsxIdentifier('size'),
        j.jsxExpressionContainer(obj)
      );
      // append the new size attr after remaining attrs
      opening.attributes = remaining.concat(sizeAttr);
    } else {
      // no breakpoint props found; just remove item attr if present
      opening.attributes = remaining;
    }
  });

  return root.toSource({ quote: 'single' });
};
