import React from 'react';
import {Container,Row,Col,Table,FormGroup,Label,Input} from 'reactstrap';
import {Button} from 'components';

export default class ManageFund extends React.Component {
  state = {email: ''}
  handleChange(e, key) {
    this.setState({
      [key]: e.target.value
    })
  }
  render(){
    return (
      <Container>
        <Row>
          <Col>
            <h3>Dividends</h3>
            <Table responsive>
              <tr>
                <th>Record date</th>
                <th>Ex-dividend date</th>
                <th>Pay date</th>
                <th>Gross dividend</th>
                <th>Dividend currency</th>
              </tr>
              {
                // <tr>
                //   <td>18/12/18</td>
                //   <td>16/12/18</td>
                //   <td>23/12/18</td>
                //   <td>0.54</td>
                //   <td>GBP</td>
                // </tr>
              }
            </Table>
            <Button
              color="primary"
              >Upload
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Documents</h3>
            <Button color="primary">Upload</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Manage notifications</h3>
            <Col xs={6}>
              <FormGroup>
                <Label>Receive trade confirmations by email?</Label>
                <Input
                  type="text"
                  value={this.state.email}
                  placeholder="Enter receiving email here..."
                  onChange={(e) => {
                    this.setState({
                      updatedEmail: true
                    })
                    this.handleChange(e, 'email')
                  }}
                />
                {
                  this.state.updatedEmail
                  ? (
                    <Button
                      color='primary'
                      onClick={() => this.setState({
                        updatedEmail: false
                      })}>
                      Save email
                    </Button>
                  ) : null
                }
              </FormGroup>
            </Col>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Bank account</h3>
            <Button color='primary'>Set bank account</Button>
          </Col>
        </Row>

      </Container>
    )
  }
}
