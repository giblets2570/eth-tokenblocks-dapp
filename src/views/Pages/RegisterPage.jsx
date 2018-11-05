import React from "react";
import {
  Card,CardHeader,CardTitle,CardBody,CardFooter,Container,Row,
  Col,Form,FormGroup,InputGroup,InputGroupAddon,InputGroupText,Input,Label
} from "reactstrap";

import { CardSocial, InfoArea, Button } from "components";
import { loadBundle, createBundle, saveBundle, formatPublicBundle } from "utils/encrypt";
import { Redirect } from 'react-router-dom';
import axios from "utils/request"
import bgImage from "assets/img/background.webp";
import Auth from 'utils/auth';
import logo from "assets/img/logo.webp";

class RegisterPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleChange(event,key) {
    this.setState({
      [key]: event.target.value
    })
  }
  async signup() {
    this.setState({ signing: true })
    await axios.post(`${process.env.REACT_APP_API_URL}auth/signup`, {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      addressLine1: this.state.addressLine1,
      addressLine2: this.state.addressLine2,
      city: this.state.city,
      postcode: this.state.postcode,
      country: this.state.country,
      juristiction: this.state.country
    });
    let response = await axios.post(`${process.env.REACT_APP_API_URL}auth/login`,{
      email: this.state.email,
      password: this.state.password
    })
    let {user, token} = response.data
    await Auth.authenticate(user, token);

    if(!(user.ik && user.signature && user.spk)) {
      let bundle;
      if(localStorage.getItem(`bundle:${user.id}`)){
        try{
          let loadedBundle = JSON.parse(localStorage.getItem(`bundle:${user.id}`));
          bundle = loadBundle(loadedBundle)
        }catch(e){
          console.log(e)
        }
      }
      if(!bundle){
        bundle = createBundle(user.id);
        let savedBundle = saveBundle( bundle);
        localStorage.setItem(`bundle:${user.id}`, JSON.stringify(savedBundle));
      }

      let publicBundle = formatPublicBundle(bundle);
      let response = await axios.put(`${process.env.REACT_APP_API_URL}users/${user.id}`, {
        ik: publicBundle.ik,
        spk: publicBundle.spk,
        signature: publicBundle.signature
      })
    }else{
      let loadedBundle = JSON.parse(localStorage.getItem(`bundle:${user.id}`))
    }
    this.setState({ signedUp: true })
  }
  render() {
    if(this.state.signedUp) {
      return <Redirect to='/investor/profile' />
    }
    return (
      <div>
        <div className="full-page-content">
          <div className="login-page">
            <Container>
              <Row className="justify-content-center">
                <Col
                  lg={5}
                  md={9}
                  xs={12}
                  >
                  <Card className="card-login card-plain">
                    <CardHeader className="text-center">
                      <div className="logo-container">
                        <img src={logo} alt="now-logo" />
                      </div>
                      <CardTitle tag="h4">Register</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <InputGroup
                        className={
                          "no-border form-control-lg " +
                          (this.state.nameFocus ? "input-group-focus" : "")
                        }
                        >
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="now-ui-icons users_circle-08" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="text"
                          placeholder="Name..."
                          onFocus={e =>
                            this.setState({ nameFocus: true })
                          }
                          onBlur={e =>
                            this.setState({ nameFocus: false })
                          }
                          onChange={
                            (e) => this.handleChange(e, 'name')
                          }
                        />
                      </InputGroup>
                      <InputGroup
                        className={
                          "no-border form-control-lg " +
                          (this.state.emailFocus ? "input-group-focus" : "")
                        }
                        >
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="now-ui-icons text_caps-small" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="email"
                          placeholder="Email..."
                          onFocus={e =>
                            this.setState({ emailFocus: true })
                          }
                          onBlur={e =>
                            this.setState({ emailFocus: false })
                          }
                          onChange={
                            (e) => this.handleChange(e, 'email')
                          }
                        />
                      </InputGroup>
                      <InputGroup
                        className={
                          "no-border form-control-lg " +
                          (this.state.passwordFocus ? "input-group-focus" : "")
                        }
                        >
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="now-ui-icons ui-1_email-85" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          type="password"
                          placeholder="Password..."
                          onFocus={e => this.setState({ passwordFocus: true })}
                          onBlur={e => this.setState({ passwordFocus: false })}
                          onChange={
                            (e) => this.handleChange(e, 'password')
                          }
                        />
                      </InputGroup>
                      {
                        // <p>Address</p>
                        //
                        // <InputGroup
                        //   className={
                        //     this.state.line1Focus ? "input-group-focus" : ""
                        //   }
                        //   >
                        //   <InputGroupAddon addonType="prepend">
                        //     <InputGroupText>
                        //       <i className="now-ui-icons location_map-big" />
                        //     </InputGroupText>
                        //   </InputGroupAddon>
                        //   <Input
                        //     type="text"
                        //     placeholder="Line 1..."
                        //     onFocus={e =>
                        //       this.setState({ line1Focus: true })
                        //     }
                        //     onBlur={e =>
                        //       this.setState({ line1Focus: false })
                        //     }
                        //     onChange={
                        //       (e) => this.handleChange(e, 'addressLine1')
                        //     }
                        //     />
                        // </InputGroup>
                        // <InputGroup
                        //   className={
                        //     this.state.line2Focus ? "input-group-focus" : ""
                        //   }
                        //   >
                        //   <InputGroupAddon addonType="prepend">
                        //     <InputGroupText>
                        //       <i className="now-ui-icons location_map-big" />
                        //     </InputGroupText>
                        //   </InputGroupAddon>
                        //   <Input
                        //     type="text"
                        //     placeholder="Line 2..."
                        //     onFocus={e =>
                        //       this.setState({ line2Focus: true })
                        //     }
                        //     onBlur={e =>
                        //       this.setState({ line2Focus: false })
                        //     }
                        //     onChange={
                        //       (e) => this.handleChange(e, 'addressLine2')
                        //     }
                        //     />
                        // </InputGroup>
                        // <InputGroup
                        //   className={
                        //     this.state.cityFocus ? "input-group-focus" : ""
                        //   }
                        //   >
                        //   <InputGroupAddon addonType="prepend">
                        //     <InputGroupText>
                        //       <i className="now-ui-icons location_map-big" />
                        //     </InputGroupText>
                        //   </InputGroupAddon>
                        //   <Input
                        //     type="text"
                        //     placeholder="City..."
                        //     onFocus={e => this.setState({ cityFocus: true })}
                        //     onBlur={e => this.setState({ cityFocus: false })}
                        //     onChange={
                        //       (e) => this.handleChange(e, 'city')
                        //     }
                        //     />
                        // </InputGroup>
                        // <InputGroup
                        //   className={
                        //     this.state.postcodeFocus ? "input-group-focus" : ""
                        //   }
                        //   >
                        //   <InputGroupAddon addonType="prepend">
                        //     <InputGroupText>
                        //       <i className="now-ui-icons location_map-big" />
                        //     </InputGroupText>
                        //   </InputGroupAddon>
                        //   <Input
                        //     type="text"
                        //     placeholder="Postcode..."
                        //     onFocus={e => this.setState({ postcodeFocus: true })}
                        //     onBlur={e => this.setState({ postcodeFocus: false })}
                        //     onChange={
                        //       (e) => this.handleChange(e, 'postcode')
                        //     }
                        //     />
                        // </InputGroup>
                        // <InputGroup
                        //   className={
                        //     this.state.countryFocus ? "input-group-focus" : ""
                        //   }
                        //   >
                        //   <InputGroupAddon addonType="prepend">
                        //     <InputGroupText>
                        //       <i className="now-ui-icons location_map-big" />
                        //     </InputGroupText>
                        //   </InputGroupAddon>
                        //   <Input
                        //     type="text"
                        //     placeholder="Country..."
                        //     onFocus={e => this.setState({ countryFocus: true })}
                        //     onBlur={e => this.setState({ countryFocus: false })}
                        //     onChange={
                        //       (e) => this.handleChange(e, 'country')
                        //     }
                        //     />
                        // </InputGroup>
                      }
                    </CardBody>
                    <CardFooter className="text-center">
                      <Button
                        color="primary"
                        size="lg"
                        block
                        disabled={this.state.signing}
                        onClick={() => this.signup()}
                        round>
                        {
                          this.state.signing
                          ? 'Signing you up...'
                          : 'Get Started'
                        }
                      </Button>
                    </CardFooter>
                  </Card>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
        <div
          className="full-page-background"
          style={{ backgroundImage: "url(" + bgImage + ")" }}
        />
      </div>
    );
  }
}

export default RegisterPage;
