import axios from 'utils/request'

let roles = ['investor','broker','custodian','fund'];

class Auth {
  constructor(){
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
    this.loadFromServer()
  }
  async loadFromServer() {
    if(this.user) {
      let {data} = await axios.get(`${process.env.REACT_APP_API_URL}users/${this.user.id}`);
      this.updateUser(data);
    }
  }
  authenticate(user, token){
    this.user = user
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
  signout(){
    localStorage.setItem('user', null);
    localStorage.setItem('token', null);
  }
  isAuthenticated(role){
    if(!role) return !!localStorage.getItem('user');
    return (this.user && role === this.user.role)
  }
  loggedInAs(){
    if(this.user) return this.user.role
  }
  getBundle(){
    if(this.isAuthenticated()) {
      return JSON.parse(localStorage.getItem(`bundle:${this.user.id}`) || null)
    }
  }
  updateUser(_user){
    let user = Object.assign({}, this.user, _user);
    localStorage.setItem('user', JSON.stringify(user));
    this.user = user
  }
}

let auth = new Auth()

export default auth
