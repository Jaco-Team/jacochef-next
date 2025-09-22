export default function handleUserAccess(accessData) {
  /**
   * @param {'access'|'view'|'edit'} action action to check
   * @param {string} key - name of access param
   * @return {boolean}
   */
  const userCan = (action, key) => {
    if (!accessData) return false;
    const keyBase = key.replace(/_(access|view|edit)$/, "");
    const view = Number(accessData[`${keyBase}_view`]) === 1;
    const edit = Number(accessData[`${keyBase}_edit`]) === 1;
    const access = Number(accessData[`${keyBase}_access`]) === 1;
    const can = {
      view: view || edit || access,
      edit: edit || access,
      access: view || edit || access,
    };
    return can[action] ?? false;
  };
  return { userCan };
}
