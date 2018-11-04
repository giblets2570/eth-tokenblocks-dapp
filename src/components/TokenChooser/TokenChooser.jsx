import React from 'react';
import {Row,Col,Card,CardBody,Table,Tooltip} from 'reactstrap';
import {Link} from 'react-router-dom';
import axios from 'utils/request';

export default class TokenChooser extends React.Component {
  state = { tokens: [] }
  async componentDidMount(){
    this.setState({ tooltipsOpen: false })
    let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens`);
    let tokens = response.data;
    this.setState({
      tokens: tokens
    });
    setTimeout(() => {
      this.setState({
        tooltipsOpen: tokens.length && this.props.tooltipsOpen
      })
    })
  }
  componentWillReceiveProps(nextProps){
    setTimeout(() => this.setState({
      tooltipsOpen: this.state.tokens.length && nextProps.tooltipsOpen
    }));
  }
  render(){
    return (
      <Table>
        <thead>
          <tr>
            <th>Fund</th>
            <th>Digital share</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            (this.state.tokens||[]).map((token, key) => (
              <tr key={key}>
                <td>
                  {token.name}
                </td>
                <td>
                  {token.symbol}
                </td>
                <td>
                  <Link
                    to={`${this.props.link}/${token.id}`}
                    >
                    <span id={`ChooseToken${key}`}>View</span>
                  </Link>
                </td>
              </tr>
            ))
          }
        </tbody>
        {
          this.state.tokens.length
          ? (
            <div>
              <Tooltip
                placement="left"
                isOpen={this.state.tooltipsOpen}
                target="ChooseToken0">
                You can view the investors by clicking this link
              </Tooltip>
            </div>
          ) : null
        }
      </Table>
    )
  }
}
