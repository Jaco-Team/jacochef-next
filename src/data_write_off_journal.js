export const data = {
  module_info: {
    name: 'Журнал списаний',
  },
  points: [
    {
      base: 'jaco_rolls_1',
      name: 'Тольятти, Ленинградская 47',
      id: '1',
      city_id: '1',
    },
    {
      base: 'jaco_rolls_2',
      name: 'Тольятти, Ворошилова 12а',
      id: '2',
      city_id: '1',
    },
    {
      base: 'jaco_rolls_3',
      name: 'Тольятти, Матросова 32',
      id: '3',
      city_id: '1',
    },
    {
      base: 'jaco_rolls_6',
      name: 'Тольятти, Цветной 1',
      id: '6',
      city_id: '1',
    },
    {
      base: 'jaco_rolls_4',
      name: 'Самара, Куйбышева 113',
      id: '4',
      city_id: '2',
    },
    {
      base: 'jaco_rolls_5',
      name: 'Самара, Победы 10',
      id: '5',
      city_id: '2',
    },
    {
      base: 'jaco_rolls_7',
      name: 'Самара, Молодёжная 2',
      id: '7',
      city_id: '2',
    },
    {
      base: 'jaco_rolls_8',
      name: 'Самара, Металлургов 76А',
      id: '8',
      city_id: '2',
    },
  ],
};

export const items = [
  {
    structure: [
      {
        name: 'Рис',
        pf: '5.120',
        price: '155',
        ed_izmer: 'кг',
      },
      {
        name: 'Мицукан',
        pf: '0.040',
        price: '45',
        ed_izmer: 'кг',
      },
      {
        name: 'Сахар',
        pf: '0.030',
        price: '15',
        ed_izmer: 'кг',
      },
      {
        name: 'Нори',
        pf: '1',
        price: '0.50',
        ed_izmer: 'шт',
      },
    ],
    dish: [
      {
        title: 'Ролл с огурцом',
        count: '1',
        ed_izmer: 'шт',
        price: '65',
      },
    ],
    users: [
      {
        user: 'Иванов С.П.',
      },
    ],
    allPrice: '215.50',
  },
];

export const data_table = [
  {
    id: '1',
    date: '03.02.2024',
    time: '12:00:45',
    price: '15.50',
    user: 'Иванов С.П.',
  },
  {
    id: '2',
    date: '06.02.2024',
    time: '14:00:45',
    price: '200',
    user: 'Иванов С.П.',
  },
];

export const modal_view = [
  {
    name: 'Рис',
    count: '5',
    price: '155',
    ed_izmer: 'кг',
    comment: 'Попало моющее средство',
  },
  {
    name: 'Ролл с огурцом',
    count: '1',
    price: '65',
    ed_izmer: 'шт',
    comment: 'Клиент не пришел',
  },
];

export const modal_new = {
  types: [
    {
      id: '1',
      name: 'Товар',
    },
    {
      id: '2',
      name: 'Не товар',
    },
  ],
  items: [
    {
      id: '1',
      name: 'Рис',
    },
    {
      id: '2',
      name: 'Мицукан',
    },
    {
      id: '3',
      name: 'Сахар',
    },
    {
      id: '4',
      name: 'Нори',
    },
  ],
};
