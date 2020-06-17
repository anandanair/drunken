let role = localStorage.getItem('role')

let items = []

var Dashboard = {
  name: 'Dashboard',
  url: '/dashboard',
  icon: 'icon-speedometer',
}

var Administration = {
  name: 'Administration',
  url: '/admin',
  icon: 'icon-setings',
}

var Consumer = {
  name: 'Consumer',
  url: '/consumer',
  icon: 'icon-add',
}

var Signout = {
  name: 'Signout',
  url: '/logout',
  icon: 'icon-logout',
}

if (role === "customer") {
  items.push(Dashboard)
  items.push(Signout)
}
else if (role === "admin") {
  items.push(Dashboard)
  items.push(Administration)
  items.push(Consumer)
  items.push(Signout)
}
else if (role === "consumer") {
  items.push(Dashboard)
  items.push(Consumer)
  items.push(Signout)
}

export default {
  items: items
};
