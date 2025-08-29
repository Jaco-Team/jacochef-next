export default function handleUserAccess(accessData) {
  /**
   * @param {'view'|'edit'} action action to check
   * @param {string} keyBase - name of access param
   * @return {boolean}
   */
  const userCan = (action, key) => {
    if (!accessData) return false;
    const keyBase = key.replace(/_(access|view|edit)$/, '');
    const active = !!accessData[`${keyBase}`];
    const access = !!accessData[`${keyBase}_access`];
    const view = !!accessData[`${keyBase}_view`];
    const edit = !!accessData[`${keyBase}_edit`];
    const can = {
      view: active && (view || access || edit),
      edit: active && (edit || access),
    };
    return can[action] ?? false;
  }
  return {userCan}
}
