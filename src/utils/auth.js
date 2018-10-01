import axios from 'utils/request'

let roles = ['investor','broker','custodian','fund'];

let Auth = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
}

Auth.authenticate = (user, token) =>  {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
Auth.signout = () => { 
  localStorage.setItem('user', null);
  localStorage.setItem('token', null);
}
Auth.isAuthenticated = (role) => {
  if(!role) return !!localStorage.getItem('user');
  return (role === Auth.user.role)
}
Auth.loggedInAs = () => {
  if(Auth.user) return Auth.user.role
}
Auth.getBundle = () => {
  if(Auth.isAuthenticated()) {
    return JSON.parse(localStorage.getItem(`bundle:${Auth.user.id}`) || null)
  }
}
Auth.updateUser = (user) => {
  Auth.user = Object.assign({}, Auth.user, user);
  localStorage.setItem('user', JSON.stringify(Auth.user));
}

export default Auth