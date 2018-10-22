import React, { Component } from 'react';
import moment from 'moment';
import {Row,Col,FormGroup,Label,Input} from 'reactstrap';
import {Button} from 'components';

class ShareClasses extends Component {
  render() {
    return (
      <div>
        <Button
          color="primary"
          onClick={() => this.props.addShareClass()}>
          Add share class
        </Button>
        {
          this.props.classes.map((_class, index) => {
            return (
              <Row key={index}>
                <Col xs={12}><span>Class: {index + 1}</span></Col>
                {
                  this.props.classProps.map((prop, key) => {
                    return (
                      <Col key={key} lg={3} sm={4} xs={12}>
                        <Input
                          style={{height: '100%'}}
                          type={prop.type ? prop.type : "text"}
                          placeholder={prop.name}
                          value={this.props.classes[index][prop.state]}
                          onChange={(e) => this.props.onClassChange(e, index, prop)}
                        >
                        {
                          prop.type === 'select'
                          ? (
                            prop.options.map((option, key) => (
                              <option key={key} value={option}>{option}</option>
                            ))
                          )
                          : null
                        }
                      </Input>
                      </Col>
                    )
                  })
                }
              </Row>
            )
          })
        }
      </div>
    )
  }
}

export default ShareClasses;
