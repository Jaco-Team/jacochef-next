# ACCESS-MAP

Статус: компактная FE-карта реально используемых access-решений в `components/sklad/**`.

## 1. Section visibility

Tab считается доступным, если backend прислал любой из broad section signals:

- `*_view`
- `*_edit`
- `*_access`

Это нужно для сценария full access после reload:

- пользователь не должен терять production или site-items tab только потому, что payload прислал `edit/access`, а не отдельный `view`

## 2. Write actions

Текущий FE использует только подтвержденные broad write contours:

- production write: section write access плюс совместимые `create_rec`, `create_pol`, `change_rec_pf`
- site-items write: section write access плюс совместимые `create_new`, `change_tag`, `reload_vk`

Plain view-only payload остается read-only:

- create button disabled
- edit button disabled
- archive/flag toggle controls disabled

## 3. Destructive actions

Текущий FE разделяет destructive actions от обычного edit scope:

- delete требует отдельный delete contour
- site-item delete принимает и совместимый legacy `delete_item`
- production delete дополнительно учитывает backend row usage state из списка
- archive restore завязан на write scope конкретной entity family, а не на общий archive section сам по себе

## 4. Что не считать canonical

Этот файл не объявляет canonical:

- полный список backend field-level flags
- предположительные `*_execute` ключи, которых нет в текущем FE contract
- legacy naming как обязательный product contract

Если ключ не участвует в текущем module-local gating, он не должен попадать в FE docs как подтвержденный canonical signal.
