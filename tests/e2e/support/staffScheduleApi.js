class StaffScheduleApi {
  constructor(request, env) {
    this.request = request;
    this.env = env;
  }

  async call(method, data = {}, options = {}) {
    const response = await this.request.post(`${this.env.apiBaseUrl}/staff_schedule/${method}`, {
      form: {
        method,
        module: "staff_schedule",
        version: "2",
        login: this.env.token,
        data: JSON.stringify(data),
      },
    });

    if (!response.ok()) {
      throw new Error(`${method} HTTP ${response.status()}`);
    }

    const json = await response.json();
    const payload = json?.data ?? json;

    if (!options.allowAppError && payload?.st === false) {
      throw new Error(`${method}: ${payload?.text || "app error"}`);
    }

    return { response, payload };
  }

  async bootstrap() {
    return (await this.call("get_all")).payload;
  }

  async graph(pointId, monthId) {
    return (
      await this.call("get_graph", {
        point_id: pointId,
        month: monthId,
      })
    ).payload;
  }

  async getUserDay(request) {
    return (await this.call("get_user_day", request)).payload;
  }

  async getUserMonth(request) {
    return (await this.call("get_user_month", request)).payload;
  }
}

module.exports = {
  StaffScheduleApi,
};
