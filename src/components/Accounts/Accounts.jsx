import React from "react";
import axios from "utils/request";
import { Table, Row, Col } from "reactstrap";
import { Line, Bar } from "react-chartjs-2";
import { Button, ManageAccountHolder } from "components";
class Accounts extends React.Component {
  state = {
    typeHash: {
      pension: "Pension",
      institutional: "Institutional",
      assetManager: "Asset Manager",
      retail: "Retail"
    },
    investor: {},
    juristictionData: {},
    typeData: {},
    options: {
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Number of shares'
          },
          ticks: {
            beginAtZero: true,
            callback: function(label, index, labels) {
              return label.toLocaleString();
            }
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
  async getBalances(props){
    let balances, data
    if(props.aggregate) {
      if(!props.fund.id) return;
      let response = await axios.get(`${process.env.REACT_APP_API_URL}funds/${props.fund.id}/balances`);
      data = response.data
      console.log(data)
    }else{
      if(!props.token.id) return;
      let response = await axios.get(`${process.env.REACT_APP_API_URL}tokens/${props.token.id}/balances`);
      data = response.data
    }
    balances = data.map((balance) => {
      balance.balance = parseFloat( balance.balance || 0 ) / Math.pow(10, 18);
      return balance;
    }).filter((balance) => balance.investor.juristiction && balance.balance);
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
    let types = balances.map((balance)=>this.state.typeHash[balance.investor.type]);
    let typeData = balances.reduce((c, balance) => {
      let index = c.labels.indexOf(this.state.typeHash[balance.investor.type]);
      if(index === -1) {
        index += c.labels.push(this.state.typeHash[balance.investor.type]);
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
      loading: false,
      balances: balances,
      typeData: typeData,
      juristictionData: juristictionData,
    })
  }
  componentDidMount() {
    this.getBalances(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.getBalances(nextProps);
  }
  setCommissionRate(){
    let rate = prompt("Set commission rate: ");

  }
  toggleManageAccountHolder(investor){
    this.setState({
      investor: investor || {},
      isAccountHolderOpen: !this.state.isAccountHolderOpen
    })
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
          <td>{this.state.typeHash[balance.investor.type]}</td>
          <td>{parseInt(balance.balance.toFixed(0)).toLocaleString()}</td>
          <td><Button color="primary" onClick={() => this.toggleManageAccountHolder(balance.investor)}>Manage</Button></td>
        </tr>
      )
    })
    return (
      <div>
        <ManageAccountHolder
          isOpen={this.state.isAccountHolderOpen}
          toggle={() => this.toggleManageAccountHolder()}
          token={this.props.token}
          fund={this.props.fund}
          investor={this.state.investor}
          />
        <Table responsive>
          <thead>
            <tr className="text-primary">
              <th>#</th>
              <th>Account</th>
              <th>Alias</th>
              <th>Juristiction</th>
              <th>Type</th>
              <th>Balance</th>
              <th></th>
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
