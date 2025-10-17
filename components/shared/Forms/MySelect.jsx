"use client";

import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export function MySelect(props) {
  const { data = [], multiple, is_none = true } = props;

  // Нормализуем id в строки
  const items = data.map((i) => ({ ...i, id: String(i.id) }));

  // Приводим value в правильный вид
  const normalizedValue = multiple
    ? Array.isArray(props.value)
      ? props.value.map(String)
      : []
    : props.value == null
    ? "" // пустое значение
    : String(props.value);

  // Обёртка onChange, чтобы наружу всегда уходил корректный тип
  // const handleChange = (e) => {
  //   if (multiple) {
  //     const arr = e.target.value || [];
  //     props.func && props.func(arr);
  //   } else {
  //     const v = e.target.value;
  //     props.func && props.func(v === "" ? null : v);
  //   }
  // };

  // Оборачиваем onChange и нормализуем event
  const handleChange = (muiEvent) => {
    // muiEvent.target.value может быть массивом или строкой
    const value = muiEvent.target.value;

    // 🧠 Костыль: создаём новый синтетический event с таким же интерфейсом, как у обычного <select>
    const customEvent = {
      ...muiEvent,
      target: {
        ...muiEvent.target,
        value,
      },
    };

    // Пробрасываем наружу как будто это обычный DOM event
    props.func && props.func(customEvent);
  };

  const labelId = "my-select-label";
  const selectId = "my-select";

  return (
    <FormControl fullWidth variant="outlined" size="small" style={props.style}>
      {props.label && (
        <InputLabel>{props.label}</InputLabel>
      )}
      <Select
        //value={normalizedValue}
        value={props.value}
        label={props.label}
        disabled={!!props.disabled}
        multiple={!!multiple}
        //onChange={handleChange}
        //onChange={props.func}
        onChange={handleChange}
        displayEmpty
        
        // Иногда на мобильных помогает:
        MenuProps={{ disablePortal: true }}
      >
        {is_none && !multiple && (
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
        )}
        {items.map((item) => (
          <MenuItem
            key={item.id}
            value={item.id}
            style={{ color: item.color ?? undefined, zIndex: 9999 }}
          >
            {item.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// "use client";

// import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

// export function MySelect(props) {
//   // normalize API ids to strings
//   const normalizedData = (props.data || []).map((item) => ({
//     ...item,
//     id: String(item.id),
//   }));

//   // add None option at the top if needed
//   // TODO: this behavior is counterintuitive, swap
//   if (props.is_none !== false) { 
//     normalizedData.unshift({ id: "none", name: "None" });
//   }

//   // normalize value
//   const normalizedValue = props.multiple
//     ? Array.isArray(props.value)
//       ? props.value.map(String)
//       : []
//     : props.value != null
//     ? String(props.value)
//     : "";

//   // force display of selected name
//   const renderValue = (selected) => {
//     if (props.multiple) {
//       if (!selected || selected.length === 0) return "None";
//       return normalizedData
//         .filter((item) => selected.includes(item.id))
//         .map((item) => item.name)
//         .join(", ");
//     } else {
//       const sel = normalizedData.find((i) => i.id === normalizedValue);
//       return sel ? sel.name : "None";
//     }
//   };

//   return (
//     <FormControl
//       fullWidth
//       variant="outlined"
//       size="small"
//       style={props.style}
//     >
//       <InputLabel shrink={props.value !== undefined && props.value !== null}>
//         {props.label}
//       </InputLabel>
//       <Select
//         value={normalizedValue}
//         label={props.label}
//         disabled={!!props.disabled}
//         onChange={props.func}
//         multiple={!!props.multiple}
//         renderValue={renderValue}
//       >
//         {normalizedData?.map((item, key) => (
//           <MenuItem
//             key={key}
//             value={item.id}
//             style={{ color: item?.color ? item.color : null, zIndex: 9999 }}
//           >
//             {item.name}
//           </MenuItem>
//         ))}
//       </Select>
//     </FormControl>
//   );
// }

// export class MySelect extends React.PureComponent {
//   constructor(props) {
//     super(props);

//     this.state = {
//     };
//   }

//   render(){
//     return (
//       <FormControl fullWidth variant="outlined" size="small" style={this.props.style}>
//         <InputLabel>{this.props.label}</InputLabel>
//         <Select
//           value={this.props.value}
//           label={this.props.label}
//           disabled={ this.props.disabled || this.props.disabled === true ? true : false }
//           onChange={ this.props.func }
//           multiple={ this.props.multiple && this.props.multiple === true ? true : false }
//           //style={{ zIndex: 9999 }}
//         >
//           {this.props.is_none === false ? null :
//             <MenuItem value=""><em>None</em></MenuItem>
//           }

//           { this.props.data?.map( (item, key) =>
//             <MenuItem key={key} value={item.id} style={{ color: item?.color ? item.color : null, zIndex: 9999 }}>{item.name}</MenuItem>
//           ) }
//         </Select>
//       </FormControl>
//     )
//   }
// }
