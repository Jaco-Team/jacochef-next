# Site Item Image Versioning

Статус: детальное предложение по реализации image versioning для `sklad/site-items`.

Цель документа:

- зафиксировать, почему текущий `upload_image` недостаточен
- предложить production-ready реализацию без новых пакетов
- вписать решение в текущую архитектуру `Sklad`
- заложить путь к возможному shared/global service

---

## 1. Что уже есть в кодовой базе

### 1.1. Что уже есть для `site_item`

Для `site_item` уже существует canonical revision stream:

- текущая запись: `jaco_site_rolls.items_new`
- история: `jaco_site_rolls.items_hist_new`
- unified history read:
  - `SkladHistoryService`
  - `SiteItemHistorySource`

Важно:

- `items_hist_new` уже хранит image-поля:
  - `img_new`
  - `img_new_update`
  - `img_app`
- значит, минимально достаточная persistence для image versioning уже есть
- отдельная таблица только ради “истории картинок” не обязательна на первом этапе

Вывод:

- базовую image version history можно и нужно строить на уже существующем revision-механизме `site_item`

### 1.2. Что уже есть для asset versioning в другом модуле

В кодовой базе уже есть близкий паттерн:

- `app/Chef/Site_setting/BannerUploadService.php`

Что он делает правильно:

- использует существующие зависимости:
  - `intervention/image`
  - `Storage`
  - S3 disks
- пишет immutable versioned files
- отдельно поддерживает alias/current-file для сайта
- хранит version metadata в persistence

Что из этого полезно для `Sklad`:

- паттерн `immutable asset + current alias`
- сервисный слой отдельно от controller
- явный upload contract

Что нельзя слепо копировать:

- banner service завязан на `banners_new.versions`
- для `site_item` у нас уже есть revision history и свои image-поля
- значит source of truth должен быть не JSON `versions`, а `items_hist_new`

---

## 2. Почему текущий `upload_image` неполон

Сейчас реализованный `sklad/site-items/upload_image`:

- принимает `file`, canonical `id` и optional `slot`
- генерирует размеры
- загружает файлы в существующие бакеты
- обновляет `items_new`
- пишет revision в `items_hist_new`
- возвращает structured image state

Но он:

- все еще опирается на existing image fields в `items_new` / `items_hist_new`
- не дает отдельного media-registry вне entity history

Итог:

- это уже item-bound image versioning внутри текущей persistence-модели
- отдельный schema redesign под media-library остается только как follow-up, если текущего revision timeline позже окажется недостаточно

---

## 3. Бизнес-требование в нормализованном виде

Для `site_item` нужно обеспечить:

1. хранение текущего изображения товара
2. хранение истории изображений товара
3. возможность увидеть, какое изображение было у конкретной revision
4. возможность сравнивать current image и historical image через existing history flow

На первом production-ready этапе этого достаточно.

Не требуется на первом этапе:

- отдельная media-library
- отдельный image bucket schema
- отдельный generic asset registry
- дифф по пикселям или binary compare

---

## 4. Recommended architecture

### 4.1. Главный принцип

Для `site_item` image versioning должен быть не “отдельным upload subsystem”, а частью revision lifecycle товара.

То есть:

- image change = это mutation `site_item`
- mutation `site_item` обязана создавать новую revision
- history UI читает image state из revision

Это лучше, чем:

- отдельно хранить картинки, отдельно хранить товар
- а потом пытаться “склеить” историю

### 4.2. Canonical source of truth

Canonical source of truth:

- current state: `jaco_site_rolls.items_new`
- historical state: `jaco_site_rolls.items_hist_new`

Не canonical:

- просто набор файлов в S3
- просто список возвращенных URL

### 4.3. Asset strategy

Рекомендуемый паттерн:

1. хранить immutable versioned assets
2. поддерживать current alias paths в текущей записи товара
3. на каждую image mutation писать revision в `items_hist_new`

Именно так:

- asset layer отвечает за файлы
- entity history layer отвечает за бизнес-состояние

---

## 5. Предлагаемый write flow

### 5.1. Новый контракт upload endpoint

Вместо текущего свободного upload contract нужен item-bound contract:

`POST|ANY /api/sklad/site-items/upload_image`

Request:

```json
{
  "data": {
    "id": 10,
    "slot": "main"
  },
  "file": "(binary)"
}
```

Где:

- `id` обязателен
- `slot` пока можно ограничить `main`

Если FE пока не готов к `slot`, можно временно:

- сделать default `slot = main`
- но в backend все равно моделировать это как slot-aware API

### 5.2. Шаги обработки

1. загрузить текущий `site_item` по `id`
2. взять lock на строку `items_new`
3. сгенерировать versioned file names
4. записать immutable assets в существующие бакеты
5. вычислить current alias paths
6. обновить image-поля в `items_new`
7. создать новую revision в `items_hist_new`
8. вернуть:
   - current image state
   - created revision meta
   - image history capability

### 5.3. Почему нужен lock

Без `lockForUpdate()` возможен race:

- два upload запроса на один item
- более поздняя картинка перетрет current state
- history/revision order станет неочевидным

Для image mutation это уже полноценная entity write operation, значит row lock оправдан.

---

## 6. Как использовать существующие поля

### 6.1. Практичный первый этап без новой схемы

Поскольку таблицы уже существуют, рекомендуемый минимальный production-ready mapping:

- `img_new`
  - current public JPG alias или основной canonical current path
- `img_new_update`
  - current public WEBP alias или secondary current path
- `img_app`
  - стабильный asset basename / transliterated item key

Важно:

- сейчас эти поля legacy-shaped и неидеальны
- но их уже достаточно, чтобы строить current + history

### 6.2. Что дополнительно сохранить в revision

В `items_hist_new` уже копируются image fields.

Значит image mutation должна:

- сначала обновить `items_new`
- затем вызвать существующий history save

Тогда каждая revision автоматически получает image snapshot.

---

## 7. File naming strategy

### 7.1. Требование

Нельзя полагаться только на transliterated item name:

- имя товара может поменяться
- два upload подряд на один товар должны давать разные immutable assets

### 7.2. Рекомендуемое имя immutable asset

Рекомендуемый формат:

- `site_item_{item_id}_{timestamp}_{width}x{height}.jpg`
- `site_item_{item_id}_{timestamp}_{width}x{height}.webp`

Например:

- `site_item_10_20260713_154512_585x585.jpg`

### 7.3. Рекомендуемый current alias

Alias paths:

- `site_item_{item_id}_{width}x{height}.jpg`
- `site_item_{item_id}_{width}x{height}.webp`

Тогда:

- immutable paths дают version history на asset layer
- alias paths дают стабильный current URL для сайта

Это повторяет сильную сторону `BannerUploadService`, но без привязки к его `versions` JSON.

---

## 8. Service design

### 8.1. Что нужно сделать в `Sklad`

Рекомендуемое разделение:

1. `SkladSiteItemImageService`
   - только asset processing
   - validate file
   - build file names
   - resize/encode
   - upload to disks
   - return structured uploaded asset set

2. `SkladSiteItemWriteService`
   - orchestration entity mutation
   - lock item row
   - call image service
   - update `items_new`
   - create history revision

3. `SiteItemHistorySource`
   - расширить image payload
   - уметь показывать versioned image snapshot из revision

### 8.2. Почему не держать все в image service

Если image service будет:

- и грузить файлы
- и обновлять entity
- и писать history

то он станет business service, а не media service.

Лучше:

- asset service остается узким
- business write остается в write service

Это соответствует текущей архитектуре `Sklad`.

---

## 9. Potential shared/global extraction

### 9.1. Что реально может стать shared позже

В shared/global слой имеет смысл выносить не `site_item`-специфичную логику, а asset-versioning primitives:

Например:

- `VersionedImageStorageService`

Ответственность такого сервиса:

- принять файл
- набор размеров
- naming strategy
- target disks
- alias strategy
- вернуть:
  - immutable paths
  - alias paths
  - public urls

### 9.2. Что не надо выносить в shared слой

Не надо выносить в generic сервис:

- обновление `items_new`
- запись `items_hist_new`
- знание о `site_item`
- mapping `img_new/img_new_update/img_app`

Это domain responsibility.

### 9.3. Рекомендуемая эволюция

Этап 1:

- закончить `site_item` image mutation внутри `Sklad`

Этап 2:

- если похожий кейс нужен еще где-то, выделить:
  - `VersionedImageStorageService`

Этап 3:

- при необходимости адаптировать `BannerUploadService` на этот shared primitive

То есть сначала:

- доказать паттерн в одном домене

Потом:

- generalized extraction

Это безопаснее, чем тащить premature global abstraction.

---

## 10. Changes required in current Sklad code

### 10.1. `upload_image` route contract

Изменить route contract:

- использовать canonical `id`
- добавить optional `slot`

### 10.2. `SkladSiteItemImageService`

Сервис должен перестать быть “free upload” сервисом.

Он должен:

- принимать уже валидированный business context
- возвращать structured asset result:
  - `immutable`
  - `alias`
  - `urls`

### 10.3. `SkladSiteItemWriteService`

Добавить новый публичный метод, например:

- `uploadImage(int $itemId, UploadedFile $file, int $actorId, string $slot = 'main'): array`

Что он делает:

- lock item
- вычисляет asset key
- вызывает image service
- обновляет `items_new`
- создает history revision
- возвращает:
  - `id`
  - `item_id`
  - `history_id`
  - `image`

### 10.4. `SiteItemHistorySource`

Расширить:

- `capabilities.image_history.supported` -> `true`

и payload revision:

- current `image.paths`
- optional `image.version_meta`

На первом этапе `version_meta` может быть легким:

- `history_id`
- `created_at`
- `paths`

Без отдельной таблицы этого уже достаточно для FE timeline.

---

## 11. FE-facing contract recommendation

### 11.1. Upload response

Рекомендуемый response:

```json
{
  "st": true,
  "item_id": 10,
  "history_id": 348,
  "image": {
    "current": {
      "jpg": [],
      "webp": []
    },
    "slot": "main"
  }
}
```

### 11.2. History read

Не нужен отдельный image-history route как canonical API.

FE должен получать image timeline через:

- `history/list`
- `history/get_one`

Для переходного периода можно сделать alias:

- `history/site-item-images`

Но canonical flow лучше не дробить.

---

## 12. Why this fits the surrounding code

Это решение хорошо ложится в текущий проект, потому что:

1. использует существующие зависимости
2. использует существующие S3 disks
3. использует уже существующий revision table `items_hist_new`
4. продолжает текущую архитектуру `Sklad`:
   - thin controller
   - write service orchestration
   - read-side history source
5. повторяет сильный паттерн `BannerUploadService`:
   - immutable assets
   - current aliases
   - version awareness
6. не требует нового пакета
7. не требует новой таблицы на первом этапе

---

## 13. Recommended implementation order

1. держать `site-items/upload_image` item-bound mutation c canonical `id`
2. обновлять `items_new` image fields внутри transaction + row lock
3. писать новую revision через existing `SkladSiteItemWriteService`
4. читать image timeline через canonical `SiteItemHistorySource`
5. держать FE contract только в `API.md`
6. отдельный shared `VersionedImageStorageService` рассматривать только если такой же процесс появится вне `Sklad`

---

## 14. Final recommendation

Senior recommendation:

- не строить отдельную “историю картинок” рядом с `site_item`
- встроить image versioning в existing `site_item revision` flow
- asset upload сделать version-aware
- business history оставить canonical через `items_hist_new`
- generalized shared service выделять только на уровне storage primitive, не на уровне domain write

Это даст:

- минимальный schema risk
- честную историю
- соответствие текущему `Sklad` history design
- реалистичный путь к future shared media versioning
