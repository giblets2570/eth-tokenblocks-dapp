import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Label
} from "reactstrap";

import { CardSocial, InfoArea, Button } from "components";
import { loadBundle, createBundle, saveBundle, formatPublicBundle } from "utils/encrypt";
import { Redirect } from 'react-router-dom';
import axios from "utils/request"
import bgImage from "assets/img/background.webp";
import Auth from 'utils/auth';

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
  async signup(e) {
    e.preventDefault()
    this.setState({
      signing: true
    })
    await axios.post(`${process.env.REACT_APP_API_URL}auth/signup`, {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password
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
          <div className="register-page">
            <Container>
              <Row className="justify-content-center">
                <Col lg={5} md={8} xs={12} className="mt-5">
                  <InfoArea
                    icon="now-ui-icons media-2_sound-wave"
                    iconColor="primary"
                    title="Instant access"
                    titleColor="info"
                    description="Instant access to global economies and funds through digital tokens."
                  />
                  <InfoArea
                    icon="now-ui-icons users_single-02"
                    iconColor="primary"
                    title="Cheaper execution"
                    titleColor="info"
                    description="Cheap and fair execution as you buy alongside others."
                  />
                  <InfoArea
                    icon="now-ui-icons media-1_button-pause"
                    iconColor="info"
                    title="Cut out middlemen"
                    titleColor="info"
                    description="Reduced costs as blockchain removes unnecessary third parties."
                  />
                </Col>
                <Col lg={4} md={8} xs={12}>
                  <Card className="card-signup">
                    <CardHeader className="text-center">
                      <CardTitle tag="h4">Register</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <Form onSubmit={(e) => this.signup(e)}>
                        <InputGroup
                          className={
                            this.state.nameFocus ? "input-group-focus" : ""
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
                            this.state.emailFocus ? "input-group-focus" : ""
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
                            this.state.passwordFocus ? "input-group-focus" : ""
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
                          // <FormGroup check>
                          //   <Label check>
                          //     <Input type="checkbox" {...this.props.inputProps} />
                          //     <span className="form-check-sign" />
                          //     <div>
                          //       I agree to the{" "}
                          //       <a href="#something">terms and conditions</a>.
                          //     </div>
                          //   </Label>
                          // </FormGroup>
                        }
                        <div className="text-center">
                          <Button color="primary" size="lg" type='submit' disabled={this.state.signing} round>
                            { this.state.signing ? 'Signing you up...': 'Get Started' }
                          </Button>
                        </div>
                      </Form>
                    </CardBody>
                    <CardFooter className="text-center">

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
