# Промты для видео (image-to-video)

Задача: из каждой картины сделать короткую (4–6 с) бесшовную петлю, где двигается **только то,
что двигалось бы в реальности**. Композиция, мазок, цвет и лица не меняются — иначе это уже не
картина Сафонкина, а нейросетевая фантазия.

## Технические требования

| Параметр | Значение |
|---|---|
| Длительность | 4–6 секунд, бесшовная петля (первый кадр = последний) |
| Разрешение | 1280×720 минимум, лучше 1440×1440 для вертикальных работ |
| Частота | 24 fps |
| Формат | MP4 (H.264), без звука |
| Имя файла | `NN-slug.mp4` по номеру работы: `05-nochnye-igry.mp4` |
| Куда класть | `assets/video/` |

Общие негативные промты (добавлять в конце): `no morphing, no warping, no added objects,
no text changes, no style change, no camera movement, no color shift, no AI artifacts`.

Общая рамка для всех: `subtle cinemagraph, oil painting stays still, only [что движется] moves,
locked camera, seamless loop, 4 seconds, painterly brushwork preserved`.

---

## 01 · Время — поющие женщины

**EN:** Women in white dresses and red headscarves stand on a green field, a fire and black smoke
rise behind them. Only: their mouths open and close faintly as if singing, the fabric of their
dresses and headscarves stirs in the wind, the fire flickers and sparks drift upward. Faces and
bodies stay perfectly still, the fire does not change shape dramatically.

**RU:** Женщины в белых платьях и красных платках стоят на зелёном поле, позади горит пожар и
поднимается чёрный дым. Двигается только: губы едва приоткрываются, будто они поют; ткань платьев
и платков колышется на ветру; пламя мерцает, искры летят вверх. Лица и фигуры неподвижны.

## 02 · Колыбельная — поющая женщина

**EN:** A woman in a red folk dress sits on a stool in a dark room and sings, a strange mechanical
dog sits beside her. Only: her mouth and throat move slightly while singing, the red shawl on her
shoulders breathes with her, dust floats in the single warm light above. The mechanical dog stays
perfectly still.

**RU:** Женщина в красном народном платье сидит на табурете в тёмной комнате и поёт, рядом
механическая собака. Двигается только: губы и горло при пении, платок на плечах дышит вместе с
ней, пыль плывёт в тёплом свете сверху. Механическая собака неподвижна.

## 05 · Ночные игры — девушка с яблоком

**EN:** A girl in a red dress stands on a broken car frame at night and bites a red apple.
Only: she blinks once, the hem of her dress and her hair stir in a light wind, the moonlight
flickers faintly through the clouds. Her pose and the smile stay exactly as painted.

**RU:** Девушка в красном платье стоит на разобранном автомобиле ночью и кусает красное яблоко.
Двигается только: одно моргание, подол платья и волосы колышутся от лёгкого ветра, лунный свет
едва мерцает сквозь облака. Поза и улыбка — точно как на картине.

## 08 · Вечная весна — розовое дерево и толпа

**EN:** A huge pink blossoming tree over a dark crowd running. Only: petals fall slowly and drift
sideways, the crown of the tree sways a little, the running crowd moves subtly like a distant
memory (barely, no new people, no clear legs). The tree trunk and the ground stay still.

**RU:** Огромное розовое цветущее дерево над тёмной бегущей толпой. Двигается только: лепестки
медленно падают и сносятся вбок, крона чуть покачивается, толпа едва шевелится, как далёкое
воспоминание (без новых людей, без чётких ног). Ствол и земля неподвижны.

## 11 · Красный смех — маска с потёками

**EN:** A figure in a grey coat wears a strange triangular mask with a human face, red drips run
down it, ruins burn behind. Only: the blue and red paint drips slide down very slowly, one drop
falls; the smoke in the background drifts. The face inside the mask is completely still.

**RU:** Фигура в серой шинели в странной треугольной маске с человеческим лицом, по ней текут
красные потёки, позади горят руины. Двигается только: синие и красные потёки очень медленно
сползают, одна капля падает; дым на фоне плывёт. Лицо в маске абсолютно неподвижно.

## 14 · Розовый ветер — женщина с кувалдой

**EN:** A blonde woman in a blue Adidas tracksuit holds a sledgehammer over her shoulder against
a pink sky, a huge rose floats above her head, thistles around. Only: her hair moves in the wind,
the rose petals tremble slightly, the thistles sway, small dust motes drift. Her face and the
hammer stay still.

**RU:** Блондинка в синем спортивном костюме с кувалдой на плече на фоне розового неба, над
головой парит огромная роза, вокруг чертополох. Двигается только: волосы от ветра, лепестки розы
едва дрожат, чертополох качается, пылинки плывут. Лицо и кувалда неподвижны.

## 19 · Марсианский вокзал — очередь с чемоданами

**EN:** Figures in spacesuits and gas masks stand on a red Martian plain with suitcases marked
"MARS BAGGAGE". Only: the red dust drifts low across the ground, the fabric of their suits and
the loose straps move slightly in the wind, the red sky churns slowly. No one walks, no faces turn.

**RU:** Фигуры в скафандрах и противогазах стоят на красной марсианской равнине с чемоданами
«MARS BAGGAGE». Двигается только: красная пыль стелется по земле, ткань костюмов и ремни чуть
колышутся на ветру, красное небо медленно клубится. Никто не идёт, лица не поворачиваются.

## 23 · Аномальное животное — человек с собакой

**EN:** A pale man with bright orange hair stands in fog beside a German shepherd with its tongue
out, a broken wooden structure and flowers around, a dim sun in the sky. Only: the dog's tongue and
ears move, the dog breathes; the fog drifts slowly; the flowers tremble slightly. The man stays
perfectly still, no hair movement.

**RU:** Бледный человек с ярко-оранжевыми волосами стоит в тумане рядом с овчаркой, у которой
высунут язык; вокруг сломанная деревянная конструкция и цветы, в небе тусклое солнце. Двигается
только: язык и уши собаки, она дышит; туман медленно плывёт; цветы едва вздрагивают. Человек
абсолютно неподвижен, волосы не шевелятся.

---

## Шаблон для остальных работ

```
[описание картины: кто/что и где] + subtle cinemagraph, only [1–2 объекта] move,
everything else frozen, locked camera, oil painting preserved, seamless 5s loop,
no morphing, no added objects, no style change
```

Правило простое: **один-два движения на картину**. Дым, ткань, пыль, дыхание, взгляд — этого
достаточно. Чем больше перечислишь, тем выше шанс, что модель начнёт «перерисовывать» лица.
