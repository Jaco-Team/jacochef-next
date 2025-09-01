"use client";

import { memo, useEffect, useState } from "react";
import cn from "@/src/helpers/ui/classnames";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MyTextInput } from "@/ui/elements";

const CafeEdit_Modal_History = (props) => {
  const { itemView, open, fullScreen, type_modal, date_edit } = props;

  const onClose = () => {
    props.onClose();
  };

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={"md"}
      onClose={onClose}
      fullScreen={fullScreen}
    >
      <DialogTitle className="button">
        <Typography style={{ alignSelf: "center" }}>
          {type_modal !== "zone" ? "Изменения выделены цветом" : "Изменения в зоне доставки"}
        </Typography>
        <IconButton
          onClick={onClose}
          style={{ cursor: "pointer" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent style={{ paddingBottom: 10, paddingTop: 10 }}>
        <Grid
          container
          spacing={3}
        >
          {type_modal === "info" && (
            <>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Город"
                  value={
                    itemView?.city_id &&
                    (itemView.city_id.color ? itemView.city_id.key : itemView.city_id)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.city_id?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Адрес"
                  value={
                    itemView?.addr && (itemView.addr.color ? itemView.addr.key : itemView.addr)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.addr?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="Район"
                  value={
                    itemView?.raion && (itemView.raion.color ? itemView.raion.key : itemView.raion)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.raion?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="Сортировка"
                  value={
                    itemView?.sort && (itemView.sort.color ? itemView.sort.key : itemView.sort)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.sort?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="Организация"
                  value={
                    itemView?.organization &&
                    (itemView.organization.color
                      ? itemView.organization.key
                      : itemView.organization)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.organization?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="ИНН"
                  value={itemView?.inn && (itemView.inn.color ? itemView.inn.key : itemView.inn)}
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.inn?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="ОГРН"
                  value={
                    itemView?.ogrn && (itemView.ogrn.color ? itemView.ogrn.key : itemView.ogrn)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.ogrn?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="КПП"
                  value={itemView?.kpp && (itemView.kpp.color ? itemView.kpp.key : itemView.kpp)}
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.kpp?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="Телефон управляющего"
                  value={
                    itemView?.phone_upr &&
                    (itemView.phone_upr.color ? itemView.phone_upr.key : itemView.phone_upr)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.phone_upr?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="Почта управляющего"
                  value={
                    itemView?.mail && (itemView.mail.color ? itemView.mail.key : itemView.mail)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.mail?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="Телефон менеджера"
                  value={
                    itemView?.phone_man &&
                    (itemView.phone_man.color ? itemView.phone_man.key : itemView.phone_man)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.phone_man?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={4}
              >
                <MyTextInput
                  label="Активность"
                  value={
                    itemView?.is_active &&
                    (itemView.is_active.color ? itemView.is_active.key : itemView.is_active)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.is_active?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
              >
                <MyTextInput
                  label="Полный адрес"
                  value={
                    itemView?.full_addr &&
                    (itemView.full_addr.color ? itemView.full_addr.key : itemView.full_addr)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.full_addr?.color,
                  })}
                />
              </Grid>
            </>
          )}

          {type_modal === "rate" ? (
            <>
              {!date_edit ? null : (
                <Grid
                  item
                  xs={12}
                  sm={12}
                >
                  <Typography style={{ alignSelf: "center", fontWeight: "bold" }}>
                    Дата начала изменений: {date_edit ?? ""}
                  </Typography>
                </Grid>
              )}
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Коэффициент количества пиццы в час"
                  value={
                    itemView?.k_pizza &&
                    (itemView.k_pizza.color ? itemView.k_pizza.key : itemView.k_pizza)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.k_pizza?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Коэффициент мойки посуды для пиццы (кух раб)"
                  value={
                    itemView?.k_pizza_kux &&
                    (itemView.k_pizza_kux.color ? itemView.k_pizza_kux.key : itemView.k_pizza_kux)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.k_pizza_kux?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Коэффициент мойки посуды для роллов (кух раб)"
                  value={
                    itemView?.k_rolls_kux &&
                    (itemView.k_rolls_kux.color ? itemView.k_rolls_kux.key : itemView.k_rolls_kux)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.k_rolls_kux?.color,
                  })}
                />
              </Grid>
            </>
          ) : null}

          {type_modal === "pay" ? (
            <>
              {!date_edit ? null : (
                <Grid
                  item
                  xs={12}
                  sm={12}
                >
                  <Typography style={{ alignSelf: "center", fontWeight: "bold" }}>
                    Дата начала изменений: {date_edit ?? ""}
                  </Typography>
                </Grid>
              )}
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Оклад директора на 2 недели"
                  value={
                    itemView?.dir_price &&
                    (itemView.dir_price.color ? itemView.dir_price.key : itemView.dir_price)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.dir_price?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Бонус от уровня директору"
                  value={
                    itemView?.price_per_lv &&
                    (itemView.price_per_lv.color
                      ? itemView.price_per_lv.key
                      : itemView.price_per_lv)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.price_per_lv?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Часовая ставка курьера"
                  value={
                    itemView?.driver_price &&
                    (itemView.driver_price.color
                      ? itemView.driver_price.key
                      : itemView.driver_price)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.driver_price?.color,
                  })}
                />
              </Grid>
            </>
          ) : null}

          {type_modal === "sett" ? (
            <>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Если в заказе только пицца, она выйдет на сборку после начала ее приготовления (напитки, допы и закуски не учитываются)"
                  value={
                    itemView?.priority_pizza &&
                    (itemView.priority_pizza.color
                      ? itemView.priority_pizza.key
                      : itemView.priority_pizza)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.priority_pizza?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Если заказ приготовить зарнее - он выйдет в приоритете на сборку, кроме предов (напитки, допы и закуски не учитываются)"
                  value={
                    itemView?.priority_order &&
                    (itemView.priority_order.color
                      ? itemView.priority_order.key
                      : itemView.priority_order)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.priority_order?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Пицца у повара будет отображаться, если более 50% роллов в заказе начнут готовить"
                  value={
                    itemView?.rolls_pizza_dif &&
                    (itemView.rolls_pizza_dif.color
                      ? itemView.rolls_pizza_dif.key
                      : itemView.rolls_pizza_dif)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.rolls_pizza_dif?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Общий стол"
                  value={
                    itemView?.cook_common_stol &&
                    (itemView.cook_common_stol.color
                      ? itemView.cook_common_stol.key
                      : itemView.cook_common_stol)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.cook_common_stol?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Кафе"
                  value={
                    itemView?.cafe_handle_close &&
                    (itemView.cafe_handle_close.color
                      ? itemView.cafe_handle_close.key
                      : itemView.cafe_handle_close)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.cafe_handle_close?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Управляющий"
                  value={
                    itemView?.manager_id &&
                    (itemView.manager_id.color ? itemView.manager_id.key : itemView.manager_id)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.manager_id?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Количество столов сборки"
                  value={
                    itemView?.count_tables &&
                    (itemView.count_tables.color
                      ? itemView.count_tables.key
                      : itemView.count_tables)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.count_tables?.color,
                  })}
                />
              </Grid>
            </>
          ) : null}

          {type_modal === "zone" ? (
            <Grid
              item
              xs={12}
              sm={12}
            >
              <Typography style={{ alignSelf: "center", fontWeight: "bold" }}>
                {`${itemView?.zone_name} ${itemView?.is_active}: ${itemView?.date_time_update}`}
              </Typography>
            </Grid>
          ) : null}

          {type_modal === "driver" ? (
            <>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Количество заказов на руках (0 - без ограничений)"
                  value={
                    itemView?.count_driver &&
                    (itemView.count_driver.color
                      ? itemView.count_driver.key
                      : itemView.count_driver)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.count_driver?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Максимальная сумма нала для курьера"
                  value={
                    itemView?.summ_driver &&
                    (itemView.summ_driver.color ? itemView.summ_driver.key : itemView.summ_driver)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.summ_driver?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Максимальная сумма нала для курьера стажера"
                  value={
                    itemView?.summ_driver_min &&
                    (itemView.summ_driver_min.color
                      ? itemView.summ_driver_min.key
                      : itemView.summ_driver_min)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.summ_driver_min?.color,
                  })}
                />
              </Grid>
            </>
          ) : null}

          {type_modal === "kkt" ? (
            <>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Номер кассы"
                  value={
                    itemView?.kassa && (itemView.kassa.color ? itemView.kassa.key : itemView.kassa)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.kassa?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Доп касса"
                  value={
                    itemView?.dop_kassa &&
                    (itemView.dop_kassa.color ? itemView.dop_kassa.key : itemView.dop_kassa)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.dop_kassa?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="РН ККТ"
                  value={
                    itemView?.number &&
                    (itemView.number.color ? itemView.number.key : itemView.number)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.number?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="База"
                  value={
                    itemView?.base && (itemView.base.color ? itemView.base.key : itemView.base)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.base?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={12}
              >
                <MyTextInput
                  label="ФН"
                  value={itemView?.fn && (itemView.fn.color ? itemView.fn.key : itemView.fn)}
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.fn?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Дата регистрации"
                  value={
                    itemView?.date_start &&
                    (itemView.date_start.color ? itemView.date_start.key : itemView.date_start)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.date_start?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Дата окончания"
                  value={
                    itemView?.date_end &&
                    (itemView.date_end.color ? itemView.date_end.key : itemView.date_end)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.date_end?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Лицензия ОФД дата завершения"
                  value={
                    itemView?.date_license &&
                    (itemView.date_license.color
                      ? itemView.date_license.key
                      : itemView.date_license)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.date_license?.color,
                  })}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
              >
                <MyTextInput
                  label="Активность"
                  value={
                    itemView?.is_active &&
                    (itemView.is_active.color ? itemView.is_active.key : itemView.is_active)
                  }
                  disabled={true}
                  className={cn({
                    disabled_input: true,
                    disabled_input_color: itemView?.is_active?.color,
                  })}
                />
              </Grid>
            </>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(CafeEdit_Modal_History);
