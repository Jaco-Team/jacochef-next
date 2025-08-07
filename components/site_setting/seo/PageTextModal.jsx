class SitePageText_Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      item: null,

      openAlert: false,
      err_status: false,
      err_text: '',

      change_link: false
    };
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.item);

    if (!this.props.item) {
      return;
    }

    if (this.props.item !== prevProps.item) {
      this.setState({
        item: this.props.item,
      });
    }
  }

  changeItemText(data, value) {
    let item = this.state.item;

    if (!item || !item.page) return;

    item.page[data] = value;

    this.setState({
      item,
    });
  }

  changeAutocomplite = (data, event, value) => {
    let item = this.state.item;

    item.page[data] = value;

    this.setState({
      item,
    });
  };

  changeItem(data, event) {
    const item = this.state.item;
    const value = event.target.value;
    const change_link = this.state.change_link;
    const mark = this.props.mark;

    if(data === 'link') {
      this.setState({
        change_link: true,
      });
    }

    if(data === 'page_name' && !change_link && mark === 'newPage') {
      const link = this.translit(value);

      item.page.link = link;
      item.page.page_name = value;
    } else {
      item.page[data] = value;
    }

    this.setState({
      item,
    });
  }

  translit(word) {
    let answer = '';

    const converter = {
      'а': 'a',    'б': 'b',    'в': 'v',    'г': 'g',    'д': 'd',
      'е': 'e',    'ё': 'e',    'ж': 'zh',   'з': 'z',    'и': 'i',
      'й': 'y',    'к': 'k',    'л': 'l',    'м': 'm',    'н': 'n',
      'о': 'o',    'п': 'p',    'р': 'r',    'с': 's',    'т': 't',
      'у': 'u',    'ф': 'f',    'х': 'h',    'ц': 'c',    'ч': 'ch',
      'ш': 'sh',   'щ': 'sh',   'ь': '',     'ы': 'y',    'ъ': '',
      'э': 'e',    'ю': 'iu',   'я': 'ia',
  
      'А': 'A',    'Б': 'B',    'В': 'V',    'Г': 'G',    'Д': 'D',
      'Е': 'E',    'Ё': 'E',    'Ж': 'ZH',   'З': 'Z',    'И': 'I',
      'Й': 'Y',    'К': 'K',    'Л': 'L',    'М': 'M',    'Н': 'N',
      'О': 'O',    'П': 'P',    'Р': 'R',    'С': 'S',    'Т': 'T',
      'У': 'U',    'Ф': 'F',    'Х': 'H',    'Ц': 'C',    'Ч': 'CH',
      'Ш': 'SH',   'Щ': 'SH',   'Ь': '',     'Ы': 'Y',    'Ъ': '',
      'Э': 'E',    'Ю': 'IU',   'Я': 'IA',   ' ': '_',    '%': '' 
    };
  
    for (let i = 0; i < word.length; i++) {
      if (converter[word[i]] === undefined){
        answer += '';
      } else {
        answer += converter[word[i]];
      }
    }
  
    return answer;
  }

  save() {
    let item = this.state.item;
    item = item.page;

    if (!item.city_id) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо выбрать город'
      });

      return;

    } 

    if (!item.page_name) {

      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать страницу'
      });

      return;

    } 

    if(!item.link) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать ссылку'
      });
      
      return;
    } 

    if(!item.page_h || !item.title ) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать все заголовки'
      });
      
      return;
    } 

    if(!item.description) {
      
      this.setState({
        openAlert: true,
        err_status: false,
        err_text: 'Необходимо указать описание'
      });
      
      return;
    } 

    this.props.save(item);

    this.onClose();
  }

  onClose() {

    this.setState ({
      item: null,
      openAlert: false,
      err_status: false,
      err_text: '',
      change_link: false
    });

    this.props.onClose();
  }

  render() {
    return (
      <>
        <MyAlert
          isOpen={this.state.openAlert}
          onClose={() => this.setState({ openAlert: false })}
          status={this.state.err_status}
          text={this.state.err_text}
        />

        <Dialog
          disableEnforceFocus
          open={this.props.open}
          onClose={this.onClose.bind(this)}
          fullScreen={this.props.fullScreen}
          fullWidth={true}
          maxWidth={'md'}
        >
          <DialogTitle className="button">
            {this.props.method}{this.props.itemName ? `: ${this.props.itemName}` : null}
            <IconButton onClick={this.onClose.bind(this)} style={{ cursor: 'pointer' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <MySelect
                  is_none={false}
                  label="Город"
                  data={this.state.item ? this.state.item.cities : []}
                  value={this.state.item ? this.state.item.page.city_id : ''}
                  func={this.changeItem.bind(this, 'city_id')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyAutocomplite
                  label="Категория"
                  multiple={false}
                  data={this.state.item ? this.state.item.category : []}
                  value={this.state.item ? this.state.item.page.category_id : ''}
                  func={this.changeAutocomplite.bind(this, 'category_id')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyTextInput
                  label="Страница"
                  value={this.state.item ? this.state.item.page.page_name : ''}
                  func={this.changeItem.bind(this, 'page_name')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyTextInput
                  label="Ссылка"
                  value={this.state.item ? this.state.item.page.link : ''}
                  func={this.changeItem.bind(this, 'link')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyTextInput
                  label="Заголовок (H1-H2)"
                  value={this.state.item ? this.state.item.page.page_h : ''}
                  func={this.changeItem.bind(this, 'page_h')}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <MyTextInput
                  label="Заголовок (title)"
                  value={this.state.item ? this.state.item.page.title : ''}
                  func={this.changeItem.bind(this, 'title')}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <MyTextInput
                  label="Описание (description)"
                  multiline={true}
                  maxRows={5}
                  value={this.state.item ? this.state.item.page.description : ''}
                  func={this.changeItem.bind(this, 'description')}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <Typography gutterBottom>
                  Текст на сайте
                </Typography>
                <TextEditor
                  value={this.state.item?.page?.content || ''}
                  func={this.changeItemText.bind(this, 'content')}
                />
              </Grid>
            
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={this.save.bind(this)}>
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
