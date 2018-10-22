import React from "react";
import axios from "utils/request";
import { Table, Row, Col } from "reactstrap";
import { Line, Bar } from "react-chartjs-2";

class Accounts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      juristictionData: {},
      typeData: {},
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
        },
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        tooltips: {
          bodySpacing: 4,
          mode: "nearest",
          intersect: 0,
          position: "nearest",
          xPadding: 10,
          yPadding: 10,
          caretPadding: 10
        },
        layout: {
          padding: { left: 0, right: 0, top: 15, bottom: 15 }
        }
      }
    };
  }
  async getBalances(props){
    if(!props.token.id) return;
    let {data} = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${props.token.id}/balances`);
    let balances = data.map((balance) => {
      balance.balance = parseFloat( balance.balance || 0 ) / Math.pow(10, props.token.decimals);
      return balance;
    }).filter((balance) => balance.investor.juristiction);
    let juristictions = balances.map((balance)=>balance.investor.juristiction);
    let juristictionData = balances.reduce((c, balance) => {
      let index = c.labels.indexOf(balance.investor.juristiction);
      if(index === -1) {
        index += c.labels.push(balance.investor.juristiction);
        c.datasets[0].data.push(0);
      }
      c.datasets[0].data[index] += Math.round(balance.balance);
      return c
    }, {
      labels: [],
      datasets: [{
        backgroundColor: "#5f236e",
        data: []
      }]
    })
    let types = balances.map((balance)=>balance.investor.type);
    let typeData = balances.reduce((c, balance) => {
      let index = c.labels.indexOf(balance.investor.type);
      if(index === -1) {
        index += c.labels.push(balance.investor.type);
        c.datasets[0].data.push(0);
      }
      c.datasets[0].data[index] += Math.round(balance.balance);
      return c
    }, {
      labels: [],
      datasets: [{
        backgroundColor: "#5f236e",
        data: []
      }]
    })
    this.setState({
      balances: balances,
      loading: false,
      juristictionData: juristictionData,
      typeData: typeData
    })
  }
  componentDidMount() {
    this.getBalances(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.getBalances(nextProps);
  }
  render() {
    if(this.state.balances && !this.state.balances.length) {
      return <p>Balances not initialised</p>
    }
    let rows = (this.state.balances||[])
    .map((balance,key) => {
      return (
        <tr key={key}>
          <td>{key+1}</td>
          <td>{balance.investor.address}</td>
          <td>{balance.investor.name}</td>
          <td>{balance.investor.juristiction}</td>
          <td>{balance.investor.type}</td>
          <td>{balance.balance.toFixed(0)}</td>
        </tr>
      )
    })
    return (
      <div>
        <Table responsive>
          <thead>
            <tr className="text-primary">
              <th className="text-center">#</th>
              <th>Account</th>
              <th>Alias</th>
              <th>Juristiction</th>
              <th>Type</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </Table>
        <Row style={{height: '200px'}}>
          <Col xs={6}>
            <p>Summary by juristiction</p>
            <Bar data={this.state.juristictionData} options={this.state.options} />
          </Col>
          <Col xs={6}>
            <p>Summary by investor type</p>
            <Bar data={this.state.typeData} options={this.state.options} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Accounts;
