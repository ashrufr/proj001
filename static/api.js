/* HairNet API client — talks to the Azure SQL-backed REST API (app.py). */
const API = (() => {
  async function req(method, path, body) {
    if (typeof fetch !== 'function') {
      throw new Error('fetch is not available');
    }
    const res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error((data && data.error) || ('HTTP ' + res.status));
    }
    return data;
  }

  return {
    req,
    bootstrap: () => req('GET', '/api/bootstrap'),
    importState: (state) => req('POST', '/api/state', state),

    createService: (d) => req('POST', '/api/services', d),
    updateService: (id, d) => req('PUT', '/api/services/' + id, d),
    deleteService: (id) => req('DELETE', '/api/services/' + id),

    createAppointment: (d) => req('POST', '/api/appointments', d),
    updateAppointment: (id, d) => req('PATCH', '/api/appointments/' + id, d),
    deleteAppointment: (id) => req('DELETE', '/api/appointments/' + id),
    appointments: () => req('GET', '/api/appointments'),

    saveHours: (hours) => req('PUT', '/api/hours', { hours }),
    saveBusinessName: (name) => req('PUT', '/api/business-name', { name }),

    signUp: (u) => req('POST', '/api/auth/signup', u),
    logIn: (u) => req('POST', '/api/auth/login', u),
    businessLogIn: (u) => req('POST', '/api/auth/business-login', u),
    signOut: () => req('DELETE', '/api/auth'),
    changePassword: (d) => req('POST', '/api/auth/change-password', d),
    forgotPassword: (email) => req('POST', '/api/auth/forgot-password', { email }),
    resetPassword: (d) => req('POST', '/api/auth/reset-password', d),
  };
})();

window.API = API;
