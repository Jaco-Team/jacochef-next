import React from 'react';

import Script from 'next/script';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { MyTextInput, MySelect, MyAutocomplite, MyCheckBox, MyDatePickerNew, formatDate, MyAlert } from '@/ui/elements';

import { api, api_laravel } from '@/src/api_new';

import dayjs from 'dayjs';

class SiteStatMarc_ extends React.Component {
  chartnewusers = null;
  chartorders = null;
  chartavgsumm = null;
  chartcountpos = null;

  chartnewusersD = null;
  chartordersD = null;
  chartavgsummD = null;
  chartcountposD = null;

 

  constructor(props) {
    super(props);
        
    this.state = {
      module: 'site_stat_marc',
      module_name: '',
      is_load: false,
      is_show_adv: false,

      show_stat_roll:   false,
      show_stat_set:    false,
      show_stat_pizza:  false,
      
      choosePoint: [],
      points: [],
      rangeDate: [formatDate(new Date()), formatDate(new Date())],
      date_start: formatDate(new Date()),
      date_end: formatDate(new Date()),
      promoName: '',

      newUsersTable: [],
      countOrdersTable: [],
      avgSumm: [],
      countPos: [],
      fakeUsers: [],

      roll_stat:    [],
      set_stat:     [],
      pizza_stat:   [],

      openAlert: false,
      err_status: true,
      err_text: '',
   //
      typesShow: [
        {id: 1, name: 'Итоговый результат'},
        {id: 2, name: 'График по месяцам'},
        {id: 3, name: 'График по дням'},
      ],
        typeShow: 1,

        // правка от 06.06.22
        colors: [0x679499, 0x2941A, 0x62941A, 0xFF0000, 0x46bdc6, 0xFFB6C1,
            0x679499, 0x2941A, 0x62941A, 0xFF0000, 0x46bdc6, 0xFFB6C1],
    };
  }

  async componentDidMount(){
    let data = await this.getData('get_all');
    
    this.setState({
      module_name: data.module_info.name,
      points: data.points
    })
    
      document.title = data.module_info.name;
  }
  
  getData = (method, data = {}) => {
    this.setState({
      is_load: true,
    });

    let res = api_laravel(this.state.module, method, data)
      .then((result) => result.data)
      .finally(() => {
        setTimeout(() => {
          this.setState({
            is_load: false,
          });
        }, 500);
      });

    return res;
  };
  
  changeChekBox(type, event) {
      this.setState({
          [type]: event.target.checked
      })
  }

  async show() {

    const choosePoint = this.state.choosePoint;

    if (!choosePoint.length) {
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Выберите точку!',
      });

      return;
    }
    
    let data = {
      points: choosePoint,
      dateStart: dayjs(this.state.date_start).format('YYYY-MM-DD'),
      dateEnd: dayjs(this.state.date_end).format('YYYY-MM-DD'),
      typeShow: this.state.typeShow,
      promoName: this.state.promoName,
      advData: this.state.advData,
    };

    let res = await this.getData('show', data);

    console.log(res);

    // Итоговый результат
    if (parseInt(this.state.typeShow) == 1) {
        
      this.setState({
        newUsersTable: res.new_users,
        countOrdersTable: res.count_orders,
        avgSumm: res.avg_summ,
        countPos: res.count_pos,
        fakeUsers: res.fake_users,
        roll_stat: res.roll_stat,
        set_stat: res.set_stat,
        pizza_stat: res.pizza_stat,
      })
    }

    // графики по месяцам
    if (parseInt( this.state.typeShow ) == 2){

      this.renderGraphNewUsers(res.new_users);
      this.renderGraphOrders(res.count_orders);
      this.renderGraphAvgSumm(res.avg_summ);
      this.renderCountPos(res.count_pos);

    }

    // графики по дням
    if (parseInt(this.state.typeShow) == 3) {

      this.renderGraphNewUsersD(res.new_users);
      this.renderGraphOrdersD(res.count_orders);
      this.renderGraphAvgSummD(res.avg_summ);
      this.renderCountPosD(res.count_pos);

    }
  }

  renderGraphNewUsers(MyData){
    if( this.chartnewusers ){
      this.chartnewusers.dispose();
    }

    var root = am5.Root.new("chartnewusers");
    this.chartnewusers = root;

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_site = [];
    var data_center = [];
    var data_all = [];

    MyData.site.map( (item) => {

      let date = item.date.split('-');

      data_site.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.center.map( (item) => {

      let date = item.date.split('-');

      data_center.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.all.map( (item) => {

      let date = item.date.split('-');

      data_all.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "month", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30
        })
      })
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

    // Create series правка 1 Новые клиенты по месяцам
    function createSeries(name, field, data) {
      var series = chart.series.push( 
      am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis, 
          yAxis: yAxis, 
          valueYField: field, 
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false
        }) 
      );

      // правка radius: 5->3
      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill")
          })
        });
      });
        
      series.strokes.template.set("strokeWidth", 2);
      if (name == 'Всего') {
         series.strokes.template.set("strokeWidth", 8)
      }
      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}")
      series.data.setAll(data);
    }

    createSeries("Сайт", "value", data_site);
    createSeries("Контакт-центр", "value", data_center);
    createSeries("Всего", "value", data_all);

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
  }

  renderGraphNewUsersD(MyData){
    if( this.chartnewusersD ){
      this.chartnewusersD.dispose();
    }

    var root = am5.Root.new("chartnewusersD");
    this.chartnewusersD = root;

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_site = [];
    var data_center = [];
    var data_kassa = [];
    var data_all = [];
   

    MyData.site.map( (item) => {
      let date = item.date_new.split('-');
      data_site.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.center.map( (item) => {
      let date = item.date_new.split('-');
      data_center.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.kassa.map( (item) => {
      let date = item.date_new.split('-');
      data_kassa.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.all.map( (item) => {
      let date = item.date_new.split('-');
      data_all.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    })


    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

    // Create series
    function createSeries(name, field, data) {

      // новые клиенты по дням правка 2
      var series = chart.series.push( 
      am5xy.SmoothedXLineSeries.new(root, {
          name: name,
         //stacked: true,
          xAxis: xAxis, 
          yAxis: yAxis, 
          valueYField: field, 
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false
        }) 
      );

      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill")
          })
        });
      });
      
        series.strokes.template.set("strokeWidth", 2);
        if (name == 'Всего') {
            series.strokes.template.set("strokeWidth", 8)
        }
        series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}")
        series.data.setAll(data);
      }

    createSeries("Сайт", "value", data_site);
    createSeries("Касса", "value", data_kassa);
    createSeries("Контакт-центр", "value", data_center);
    createSeries("Всего", "value", data_all);
   

    // Add cursor
    
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
    
  }

  renderGraphOrders(MyData){
    if( this.chartorders ){
      this.chartorders.dispose();
    }

    var root = am5.Root.new("chartorders"); 

    this.chartorders = root;

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_all = [];
    var data_pic = [];
    var data_dev = [];
    var data_hall = [];
    var data_adv = [];
     
    MyData.all.map( (item) => {

      let date = item.date_new.split('-');

      data_all.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.pic.map( (item) => {

      let date = item.date_new.split('-');

      data_pic.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.dev.map( (item) => {

      let date = item.date_new.split('-');

      data_dev.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.hall.map( (item) => {

      let date = item.date_new.split('-');

      data_hall.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    })

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "month", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30
        })
      })
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

    // Create series Правка 3 Заказы по месяцам
    function createSeries(name, field, data) {
      var series = chart.series.push( 
      am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis, 
          yAxis: yAxis, 
          valueYField: field, 
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false
        }) 
      );
      
      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill")
          })
        });
      });
      
      series.strokes.template.set("strokeWidth", 2);
      if (name == 'Всего') {
        series.strokes.template.set("strokeWidth", 8)
      }
      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}")
      series.data.setAll(data);
    }

    createSeries("Всего", "value", data_all);
    createSeries("Самовывозов", "value", data_pic);
    createSeries("Доставок", "value", data_dev);
    createSeries("Зал", "value", data_hall);
   
    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
  }

   // заказы по дням
  renderGraphOrdersD(MyData){
    if( this.chartordersD ){
      this.chartordersD.dispose();
    }

    var root = am5.Root.new("chartordersD"); 

    this.chartordersD = root;

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    root.dateFormatter.setAll({
        dateFormat: "yyyy-MM-dd", 
        dateFields: ["valueX", "openValueX"] 
    });

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_all = [];
    var data_pic = [];
    var data_dev = [];
    var data_hall = [];
 
    MyData.all.map( (item) => {
      let date = item.date_new.split('-');
      data_all.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.pic.map( (item) => {
      let date = item.date_new.split('-');
      data_pic.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.dev.map( (item) => {
      let date = item.date_new.split('-');
      data_dev.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.hall.map( (item) => {
      let date = item.date_new.split('-');
      data_hall.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    })
     
     // Create Y-axis
      var yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
              extraTooltipPrecision: 1,
              renderer: am5xy.AxisRendererY.new(root, {})
          })
      );

    // Create X-Axis
      let xAxis = chart.xAxes.push(
          am5xy.DateAxis.new(root, {
            baseInterval: { timeUnit: "day", count: 1 },
            startLocation: 0.5,
            endLocation: 0.5,
            renderer: am5xy.AxisRendererX.new(root, {})
          })
      );

      xAxis.get("dateFormats")["day"] = "MM/dd";
      xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

      var yAxis2 = chart.yAxes.push(
          am5xy.CategoryAxis.new(root, {
              categoryField: "category",
              extraTooltipPrecision: 1,
              renderer: am5xy.AxisRendererY.new(root, { inversed: true }),
              //tooltip: am5.Tooltip.new(root, {
              //    themeTags: ["axis"],
              //    animationDuration: 200
              //})
          })
      );


    // Create series правка 4 Заказы по дням
    function createSeries(name, field, data) {
     
      var series = chart.series.push( 
        am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis, 
          yAxis: yAxis, 
          valueYField: field,
          strokeWidth: 5,
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false
        }) 
      );

      series.strokes.template.set("strokeWidth", 2);

      if (name == 'Всего') {
          series.strokes.template.set("strokeWidth", 8)
      }
       
      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill")
          })
        });
      });
      
      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}")
      series.data.setAll(data);
    }

      // Новый график рекламнеы компании, заказы по дням
      let colors = this.state.colors;
      function createSeries2(name, field, data) {

          let cat = [];
          data.map((item, k) => {
              data[k].name = item.category;
              data[k].promo = (item.promo != "" || item.promo.length > 0) ? '\nПромокод: ' + item.promo : '';
              data[k].columnSettings.fill = am5.color(colors[k]);
              cat.push({ 'category': item.category })
          })

          // привязка категории
          yAxis2.data.setAll(cat);

          // инфилизация настроик графика
          var series2 = null;
          let ser_settings = {
              xAxis: xAxis,
              yAxis: yAxis2,
              openValueXField: "fromDate",
              valueXField: "toDate",
              categoryYField: "category",
              sequencedInterpolation: true,
          }

          // перебор массия для заполнения подсказки и цвета Рек. Компании
          data.map(function (item, key) {
              ser_settings['fill'] = am5.color(colors[key]);

              series2 = chart.series.push(
                  am5xy.ColumnSeries.new(root, ser_settings));

              series2.columns.template.setAll({
                  templateField: "columnSettings",
                  strokeOpacity: 0,
                  tooltipText: "[bold]{category}[/]\n{description}\n" +
                      "{openValueX.formatDate('yyyy-MM-dd')} - {valueX.formatDate('yyyy-MM-dd')}" +
                      "{promo}"
              });

              series2.bullets.push(function () {
                  return am5.Bullet.new(root, {
                      sprite: am5.Circle.new(root, {
                          radius: 2,
                          fill: series2.get("fill")
                      })
                  });
              });
          })

          series2.columns.template.setAll({
              opacity: 0.5,
          });

          series2.data.processor = am5.DataProcessor.new(root, {
              dateFields: ["fromDate", "toDate"],
              dateFormat: "yyyy-MM-dd HH:mm"
          });

          series2.data.setAll(data);
      }

      createSeries("Всего", "value", data_all);
      createSeries("Самовывозов", "value", data_pic);
      createSeries("Доставок", "value", data_dev);
      createSeries("Зал", "value", data_hall);

     // правка от 08.04 показываем столбики
     if (this.state.is_show_adv && MyData.adv_data.length > '1') {
        createSeries2("Акция", "value", MyData.adv_data);
     }
    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
  }

  renderGraphAvgSumm(MyData){
    if( this.chartavgsumm ){
      this.chartavgsumm.dispose();
    }

    var root = am5.Root.new("chartavgsumm"); 

    this.chartavgsumm = root;

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_all = [];
    var data_pic = [];
    var data_dev = [];
    var data_hall = [];

    MyData.all.map( (item) => {
      let date = item.date_new.split('-');
      data_all.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.pic.map( (item) => {
      let date = item.date_new.split('-');
      data_pic.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.dev.map( (item) => {
      let date = item.date_new.split('-');
      data_dev.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.hall.map( (item) => {
      let date = item.date_new.split('-');
      data_hall.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "month", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30
        })
      })
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

     

      // Create series правка 4 Заказы по дням
      function createSeries(name, field, data) {

          var series = chart.series.push(
              am5xy.SmoothedXLineSeries.new(root, {
                  name: name,
                  xAxis: xAxis,
                  yAxis: yAxis,
                  valueYField: field,
                  //fill: chart.get("colors").getIndex(13),
                  strokeWidth: 5,
                  valueXField: "date",
                  tooltip: am5.Tooltip.new(root, {}),
                  maskBullets: false
              })
          );

          series.strokes.template.set("strokeWidth", 2);
          if (name == 'Всего') {
              series.strokes.template.set("strokeWidth", 8)
          }

          series.bullets.push(function () {
              return am5.Bullet.new(root, {
                  sprite: am5.Circle.new(root, {
                      radius: 2,
                      fill: series.get("fill")
                  })
              });
          });

          series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}");
         
          series.data.setAll(data);
      }
    createSeries("Всего", "value", data_all);
    createSeries("Самовывозов", "value", data_pic);
    createSeries("Доставок", "value", data_dev);
    createSeries("Зал", "value", data_hall);
    
    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
  }
   // график средний чек за день
  renderGraphAvgSummD(MyData){
    if( this.chartavgsummD ){
      this.chartavgsummD.dispose();
    }

    var root = am5.Root.new("chartavgsummD"); 

    this.chartavgsummD = root;

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    root.dateFormatter.setAll({
       dateFormat: "yyyy-MM-dd",
       dateFields: ["valueX", "openValueX"]
    });

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_all = [];
    var data_pic = [];
    var data_dev = [];
    var data_hall = [];

    MyData.all.map( (item) => {

      let date = item.date_new.split('-');

      data_all.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.pic.map( (item) => {

      let date = item.date_new.split('-');

      data_pic.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.dev.map( (item) => {

      let date = item.date_new.split('-');

      data_dev.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.hall.map( (item) => {

      let date = item.date_new.split('-');

      data_hall.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    })

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

    var yAxis2 = chart.yAxes.push(
        am5xy.CategoryAxis.new(root, {
            categoryField: "category",
            extraTooltipPrecision: 1,
            renderer: am5xy.AxisRendererY.new(root, { inversed: true }),
            //tooltip: am5.Tooltip.new(root, {
            //    themeTags: ["axis"],
            //    opacity: 0.4,
            //    animationDuration: 200
            //})
        })
    );

      // Create series правка 4 Заказы по дням
      function createSeries(name, field, data) {

          var series = chart.series.push(
              am5xy.SmoothedXLineSeries.new(root, {
                  name: name,
                  xAxis: xAxis,
                  yAxis: yAxis,
                  valueYField: field,
                  strokeWidth: 5,
                  valueXField: "date",
                  tooltip: am5.Tooltip.new(root, {}),
                  maskBullets: false
              })
          );

          series.strokes.template.set("strokeWidth", 2);

          if (name == 'Всего') {
              series.strokes.template.set("strokeWidth", 8)
          }

          series.bullets.push(function () {
              return am5.Bullet.new(root, {
                  sprite: am5.Circle.new(root, {
                      radius: 2,
                      fill: series.get("fill")
                  })
              });
          });

          series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}")
          series.data.setAll(data);
      }

      // Новый график Рекламные компании, Средний чек за день
      let colors = this.state.colors;
      function createSeries2(name, field, data) {

          let cat = [];
          data.map((item, k) => {
              data[k].name  = item.category;
              data[k].promo = (item.promo != "" || item.promo.length > 0) ? '\nПромокод: ' + item.promo : '';
              data[k].columnSettings.fill = am5.color(colors[k]);
              cat.push({ 'category': item.category })
          })

          // привязка категории
          yAxis2.data.setAll(cat);

          // инфилизация настроик графика
          var series2 = null;
          let ser_settings = {
              xAxis: xAxis,
              yAxis: yAxis2,
              openValueXField: "fromDate",
              valueXField: "toDate",
              categoryYField: "category",
              sequencedInterpolation: true,
          }

          // перебор массия для заполнения подсказки и цвета Рек. Компании
          data.map(function (item, key) {
              ser_settings['fill'] = am5.color(colors[key]);

              series2 = chart.series.push(
                  am5xy.ColumnSeries.new(root, ser_settings));

              series2.columns.template.setAll({
                  templateField: "columnSettings",
                  strokeOpacity: 0,
                  tooltipText: "[bold]{category}[/]\n{description}\n" +
                      "{openValueX.formatDate('yyyy-MM-dd')} - {valueX.formatDate('yyyy-MM-dd')}" +
                      "{promo}"
              });

              series2.bullets.push(function () {
                  return am5.Bullet.new(root, {
                      sprite: am5.Circle.new(root, {
                          radius: 2,
                          fill: series2.get("fill")
                      })
                  });
              });
          })

          series2.columns.template.setAll({
              opacity: 0.5,
          });

          series2.data.processor = am5.DataProcessor.new(root, {
              dateFields: ["fromDate", "toDate"],
              dateFormat: "yyyy-MM-dd HH:mm"
          });

          series2.data.setAll(data);
      }

    createSeries("Всего", "value", data_all);
    createSeries("Самовывозов", "value", data_pic);
    createSeries("Доставок", "value", data_dev);
    createSeries("Зал", "value", data_hall);

    // показ акций
    if (this.state.is_show_adv && MyData.adv_data.length > '1') {
        createSeries2("Акция", "value", MyData.adv_data);
    }

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
  }

  renderCountPos(MyData){
    if( this.chartcountpos ){
      this.chartcountpos.dispose();
    }

    var root = am5.Root.new("chartcountpos"); 

    this.chartcountpos = root;

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_pizza = [];
    var data_rolls = [];
    var data_adv = [];

    MyData.count_pizza.map( (item) => {

      let date = item.date_new.split('-');

      data_pizza.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.count_rolls.map( (item) => {

      let date = item.date_new.split('-');

      data_rolls.push({
        date: new Date(date[0], parseInt(date[1])-1, 1).getTime(),
        value: parseInt(item.count)
      })
    })

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "month", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30
        })
      })
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

    // Create series правка 7 Позиций по месяцам
    function createSeries(name, field, data) {
      var series = chart.series.push( 
          am5xy.SmoothedXLineSeries.new(root, {
          name: name,
          xAxis: xAxis, 
          yAxis: yAxis, 
          valueYField: field, 
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {}),
          maskBullets: false
        }) 
      );
      
      series.bullets.push(function() {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 2,
            fill: series.get("fill")
          })
        });
      });
      
      series.strokes.template.set("strokeWidth", 2);
      
      series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}")
      series.data.setAll(data);
    }
    function createSeries2(name, field, data) {

        // вытаскиваем название акции
        let adv1 = [], adv2 = [];
        let lKey = 0, newArr = false;

        // разделяем на два массива
        for (const [key, value] of data.entries()) {
            lKey = key == 0 ? 1 : key - 1;
            if (key == 0) {
                adv1.push(value);
            } else if (data[lKey]['name'] != value['name']) {
                adv2.push(value);
                newArr = true;
            } else if (newArr) {
                adv2.push(value);
            } else {
                adv1.push(value);
            }
        }

        // инцилизация первого массива на графике
        if (adv1.length != 0) {
            var series2 = chart.series.push(
                am5xy.ColumnSeries.new(root, {
                    name: adv1[0]['name'],
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: field,
                    valueXField: "date",
                    categoryXField: "date",
                    color: '0x6794DC',
                    clustered: false,
                    tooltip: am5.Tooltip.new(root, {
                        pointerOrientation: "horizontal",
                        labelText: adv1[0]['name']
                    })
                })
            );

            series2.columns.template.setAll({
                opacity: 0.5,
                width: am5.percent(80),
                templateField: "columnSettings",
            });

            chart.get("colors").set("colors", [
                am5.color(0x6794DC),
            ]);

            // меняем цвет
            series2.set("fill", am5.color(0x6794DC));
            series2.data.setAll(adv1);
        }

        // инцилизация второго массива на графике
        if (adv2.length != 0) {
            var series3 = chart.series.push(
                am5xy.ColumnSeries.new(root, {
                    name: adv2[0]['name'],
                    xAxis: xAxis,
                    yAxis: yAxis,
                    valueYField: field,
                    valueXField: "date",
                    categoryXField: "date",
                    color: '0x6794DC',
                    clustered: false,
                    tooltip: am5.Tooltip.new(root, {
                        pointerOrientation: "horizontal",
                        labelText: adv2[0]['name']
                    })
                })
            );

            series3.columns.template.setAll({
                opacity: 0.5,
                width: am5.percent(80),
                templateField: "columnSettings",
            });

            chart.get("colors").set("colors", [
                am5.color(0x6794DA),
            ]);

            // меняем цвет
            series3.set("fill", am5.color(0x6794DA));
            series3.data.setAll(adv2);
        }
    }
    createSeries("Роллов", "value", data_rolls);
    createSeries("Пиццы", "value", data_pizza);
    //if (this.state.is_show_adv && MyData.adv_data) {
    //    createSeries2("Акция", "value", data_adv)
    //}
    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
  }

  // Позиций по дням
  renderCountPosD(MyData){
    if( this.chartcountposD ){
      this.chartcountposD.dispose();
    }

    var root = am5.Root.new("chartcountposD"); 

    this.chartcountposD = root;

    root.setThemes([
       am5themes_Animated.new(root)
    ]);

    root.dateFormatter.setAll({
       dateFormat: "yyyy-MM-dd",
       dateFields: ["valueX", "openValueX"]
    });

    var chart = root.container.children.push( 
      am5xy.XYChart.new(root, {
        panY: false,
        wheelY: "zoomX",
        layout: root.verticalLayout,
        //maxTooltipDistance: 0
      }) 
    );

    var data_pizza = [];
    var data_rolls = [];
    MyData.count_pizza.map( (item) => {

      let date = item.date_new.split('-');

      data_pizza.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    } )

    MyData.count_rolls.map( (item) => {

      let date = item.date_new.split('-');

      data_rolls.push({
        date: new Date(date[0], parseInt(date[1])-1, parseInt(date[2])).getTime(),
        value: parseInt(item.count)
      })
    })

    // Create Y-axis
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        extraTooltipPrecision: 1,
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    // Create X-Axis
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: "day", count: 1 },
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {})
      })
    );

    xAxis.get("dateFormats")["day"] = "MM/dd";
    xAxis.get("periodChangeDateFormats")["day"] = "MM/dd";

      var yAxis2 = chart.yAxes.push(
          am5xy.CategoryAxis.new(root, {
              categoryField: "category",
              extraTooltipPrecision: 1,
              renderer: am5xy.AxisRendererY.new(root, { inversed: true }),
              //tooltip: am5.Tooltip.new(root, {
              //    themeTags: ["axis"],
              //    animationDuration: 200
              //})
          })
      );

      // Create series правка 4 Заказы по дням
      function createSeries(name, field, data) {

          var series = chart.series.push(
              am5xy.SmoothedXLineSeries.new(root, {
                  name: name,
                  xAxis: xAxis,
                  yAxis: yAxis,
                  valueYField: field,
                  //fill: chart.get("colors").getIndex(13),
                  strokeWidth: 5,
                  valueXField: "date",
                  tooltip: am5.Tooltip.new(root, {}),
                  maskBullets: false
              })
          );

          series.strokes.template.set("strokeWidth", 2);

          if (name == 'Всего') {
              //series.strokes.template.set("stroke", 'red');
              series.strokes.template.set("strokeWidth", 8)
          }

          series.bullets.push(function () {
              return am5.Bullet.new(root, {
                  sprite: am5.Circle.new(root, {
                      radius: 2,
                      fill: series.get("fill")
                  })
              });
          });

          series.get("tooltip").label.set("text", "[bold]{name}[/]\n{valueX.formatDate()}: {valueY}")
          series.data.setAll(data);
      }

      // Новый график Рекламные компании, Позиций по дням
      let colors = this.state.colors;
      function createSeries2(name, field, data) {

          let cat = [];
          data.map((item, k) => {
              data[k].name = item.category;
              data[k].promo = (item.promo != "" || item.promo.length > 0) ? '\nПромокод: ' + item.promo : '';
              data[k].columnSettings.fill = am5.color(colors[k]);
              cat.push({ 'category': item.category })
          })

          // привязка категории
          yAxis2.data.setAll(cat);

          // инфилизация настроик графика
          var series2 = null;
          let ser_settings = {
              xAxis: xAxis,
              yAxis: yAxis2,
              openValueXField: "fromDate",
              valueXField: "toDate",
              categoryYField: "category",
              sequencedInterpolation: true,
          }

          // перебор массия для заполнения подсказки и цвета Рек. Компании
          data.map(function (item, key) {
              ser_settings['fill'] = am5.color(colors[key]);

              series2 = chart.series.push(
                  am5xy.ColumnSeries.new(root, ser_settings));

              series2.columns.template.setAll({
                  templateField: "columnSettings",
                  strokeOpacity: 0,
                  tooltipText: "[bold]{category}[/]\n{description}\n" +
                      "{openValueX.formatDate('yyyy-MM-dd')} - {valueX.formatDate('yyyy-MM-dd')}" +
                      "{promo}"
              });

              series2.bullets.push(function () {
                  return am5.Bullet.new(root, {
                      sprite: am5.Circle.new(root, {
                          radius: 2,
                          fill: series2.get("fill")
                      })
                  });
              });
          })

          series2.columns.template.setAll({
              opacity: 0.5,
          });

          series2.data.processor = am5.DataProcessor.new(root, {
              dateFields: ["fromDate", "toDate"],
              dateFormat: "yyyy-MM-dd HH:mm"
          });

          series2.data.setAll(data);
      }

     createSeries("Роллов", "value", data_rolls);
     createSeries("Пиццы", "value", data_pizza);
      
     if (this.state.is_show_adv && MyData.adv_data.length > '1') {
        createSeries2("Акция", "value", MyData.adv_data)
     }

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomXY",
      xAxis: xAxis
    }));

    xAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));

    yAxis.set("tooltip", am5.Tooltip.new(root, {
      themeTags: ["axis"]
    }));
  }

  changeDateRange(data, val) {
    this.setState({
      [data]: (val)
    })
  }

  showStat(type) {
      let val;
      switch (type) {
          case 'roll':
              val = this.state.show_stat_roll ? false : true;
              this.setState({ show_stat_roll: val })
          break;
          case 'set':
              val = this.state.show_stat_set ? false : true;
              this.setState({ show_stat_set: val });
              
          break;
          case 'pizza':
              val = this.state.show_stat_pizza ? false : true;
              this.setState({ show_stat_pizza: val });
          break;
      }
  }

  render(){
    return (
      <>
        <Script src="https://cdn.amcharts.com/lib/5/index.js"></Script>
        <Script src="https://cdn.amcharts.com/lib/5/xy.js"></Script>
        <Script src="//cdn.amcharts.com/lib/5/themes/Animated.js"></Script>

        <Backdrop style={{ zIndex: 99 }} open={this.state.is_load}>
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Grid container spacing={3} className='container_first_child'>
          <Grid item xs={12} sm={12}>
            <h1>{this.state.module_name}</h1>
          </Grid>

          <MyAlert
            isOpen={this.state.openAlert}
            onClose={() => this.setState({ openAlert: false })}
            status={this.state.err_status}
            text={this.state.err_text}
          />

          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата от" value={ this.state.date_start } func={ this.changeDateRange.bind(this, 'date_start') } />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MyDatePickerNew label="Дата от" value={ this.state.date_end } func={ this.changeDateRange.bind(this, 'date_end') } />
          </Grid>


          <Grid item xs={12} sm={3}>
            <MyAutocomplite data={this.state.points} value={this.state.choosePoint} func={ (event, data) => { this.setState({ choosePoint: data }) } } multiple={true} label='Точка' />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MyTextInput value={this.state.promoName} func={ (event) => { this.setState({ promoName: event.target.value }) } } label='Промокод' />
          </Grid>
          <Grid item xs={6} sm={3}> 
            <MySelect data={this.state.typesShow} value={this.state.typeShow} func={ (event) => { this.setState({ typeShow: event.target.value }) } } label='Как показать' />
          </Grid>
          <Grid item xs={12} sm={1}> 
            <MyCheckBox label='Показать акции' value={this.state.is_show_adv} func={this.changeChekBox.bind(this, 'is_show_adv') }   />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={this.show.bind(this)}>Обновить данные</Button>
          </Grid>
        

          { this.state.typeShow != 1 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Новые клиенты итог</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>Всего</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Касса</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Контакт-центр</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Сайт</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.newUsersTable.all ? this.state.newUsersTable.all : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.newUsersTable.kassa ? this.state.newUsersTable.kassa : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.newUsersTable.center ? this.state.newUsersTable.center : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.newUsersTable.site ? this.state.newUsersTable.site : 0}</TableCell>
                    </TableRow>

                    
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          }

          { this.state.typeShow != 1 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Заказы итог</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>Всего</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Доставок</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Зал</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Самовывоз</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.countOrdersTable.all ? this.state.countOrdersTable.all : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.countOrdersTable.dev ? this.state.countOrdersTable.dev : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.countOrdersTable.hall ? this.state.countOrdersTable.hall : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.countOrdersTable.pic ? this.state.countOrdersTable.pic : 0}</TableCell>
                    </TableRow>

                    
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          }

          { this.state.typeShow != 1 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Средний чек итог</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>Всего</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Доставка</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Зал</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Самовывоз</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.avgSumm.all ? this.state.avgSumm.all : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.avgSumm.dev ? this.state.avgSumm.dev : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.avgSumm.hall ? this.state.avgSumm.hall : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.avgSumm.pic ? this.state.avgSumm.pic : 0}</TableCell>
                    </TableRow>

                    
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          }

          { this.state.typeShow != 1 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' } }>Позиций итог</h2>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>Роллов</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Пиццы</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.countPos.count_rolls ? this.state.countPos.count_rolls : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.countPos.count_pizza ? this.state.countPos.count_pizza : 0}</TableCell>
                    </TableRow>

                    
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          }

          { this.state.typeShow != 1 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Ушедшие клиенты</h2>
              <h5 style={{ textAlign: 'center' }}>ушли - заказывали за 90 дней до указанного периода и больше не заказывали</h5>
              <h5 style={{ textAlign: 'center' }}>вернулись - не заказывали 90 дней до указанного периода, сделали заказ в указанный период</h5>
              <h5 style={{ textAlign: 'center' }}>вернулись и продолжают заказывать - не заказывали 90 дней до указанного периода, сделали заказ в указанный период и были заказы с окончания периода по вчерашний день</h5>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>Ушли</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Вернулись</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>Вернулись и продолжают заказывать</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                  
                    <TableRow>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.fakeUsers.lost_users ? this.state.fakeUsers.lost_users : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.fakeUsers.ret_users ? this.state.fakeUsers.ret_users : 0}</TableCell>
                      <TableCell style={{ textAlign: 'center' }}>{this.state.fakeUsers.ret_users_more ? this.state.fakeUsers.ret_users_more : 0}</TableCell>
                    </TableRow>

                    
                  </TableBody>
                </Table>
              </TableContainer>

                 <Grid container spacing={3}>
                   
                    <Grid style={{ marginTop: 20, marginBottom: 200}} item xs={12} sm={4}> 
                        <h2 style={{ textAlign: 'center' }}>Рейтинг роллов </h2>
                        <h5 style={{ textAlign: 'center', cursor: 'pointer' }} onClick={this.showStat.bind(this, 'roll')} >Показать/Скрыть</h5>
                        {this.state.show_stat_roll != true ? null :
                            <TableContainer style={{ marginTop: 20 }} component={Paper} >
                                <Table>
                                    <TableBody>

                                        {this.state.roll_stat.map((item, key) =>
                                            <TableRow key={key}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{item.count}</TableCell>
                                            </TableRow>
                                        )}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        }
                    </Grid>

                    <Grid style={{ marginTop: 20, marginBottom: 200 }} item xs={12} sm={4}>
                        <h2 style={{ textAlign: 'center' }}>Рейтинг сетов</h2>
                        <h5 style={{ textAlign: 'center', cursor: 'pointer' }} onClick={this.showStat.bind(this, 'set')} >Показать/Скрыть</h5>
                        {this.state.show_stat_set != true ? null :
                            <TableContainer style={{ marginTop: 20 }} component={Paper} >
                                <Table>
                                    <TableBody>

                                        {this.state.set_stat.map((item, key) =>
                                            <TableRow key={key}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{item.count}</TableCell>
                                            </TableRow>
                                        )}

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        }
                    </Grid>

                     <Grid style={{ marginTop: 20, marginBottom: 200 }} item  xs={12} sm={4}> 
                        <h2 style={{ textAlign: 'center' }}>Рейтинг Пиццы</h2>
                        <h5 style={{ textAlign: 'center', cursor: 'pointer' }} onClick={this.showStat.bind(this, 'pizza')}>Показать/Скрыть</h5>
                        {this.state.show_stat_pizza != true ? null :
                             <TableContainer style={{ marginTop: 20 }} component={Paper} >
                                <Table>
                                    <TableBody>

                                        {this.state.pizza_stat.map((item, key) =>
                                            <TableRow key={key}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell style={{ textAlign: 'center' }}>{item.count}</TableCell>
                                            </TableRow>
                                        )}

                                    </TableBody>
                                </Table>
                             </TableContainer>
                         }
                    </Grid>
               </Grid>
             </Grid>
            }

          { this.state.typeShow != 2 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Новые клиенты по месяцам</h2>
              <div id="chartnewusers" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }

          { this.state.typeShow != 2 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Заказы по месяцам</h2>
              <div id="chartorders" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }

          { this.state.typeShow != 2 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Средний чек по месяцам</h2>
              <div id="chartavgsumm" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }

          { this.state.typeShow != 2 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Позиций по месяцам</h2>
              <div id="chartcountpos" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }


          { this.state.typeShow != 3 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Новые клиенты по дням</h2>
              <div id="chartnewusersD" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }

          { this.state.typeShow != 3 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Заказы по дням</h2>
              <div id="chartordersD" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }

          { this.state.typeShow != 3 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Средний чек по дням</h2>
              <div id="chartavgsummD" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }

          { this.state.typeShow != 3 ? null :
            <Grid item xs={12}>
              <h2 style={{ textAlign: 'center' }}>Позиций по дням</h2>
              <div id="chartcountposD" style={{ width: "100%", height: "500px" }} />
            </Grid>
          }


        </Grid>
      </>
    )
  }
}

export default function SiteStatMarc() {
  return <SiteStatMarc_ />;
}

export async function getServerSideProps({ req, res, query }) {
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');

  return {
    props: {},
  }
}
