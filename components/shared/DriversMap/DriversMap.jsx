import Script from 'next/script';


const DriversMap = () => {
  
  return (
    <>
    <Script src="https://api-maps.yandex.ru/2.1/?apikey=665f5b53-8905-4934-9502-4a6a7b06a900&lang=ru_RU" />
    <Backdrop open={this.state.is_load} style={{ zIndex: 99 }}>
        <CircularProgress color="inherit" />
    </Backdrop>
    </>
  )
}

export default DriversMap;
