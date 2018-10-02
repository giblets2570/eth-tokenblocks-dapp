import { Col, Table } from 'reactstrap'
import { subscribe, subscribeOnce } from 'utils/socket'
import React from 'react'
import {Button} from 'components'

class TradeBrokers extends React.Component {
  constructor(props){
    super(props)
    this.state = {}
  }
  componentWillReceiveProps(nextProps) {
    if(this.props.trade.id !== nextProps.trade.id) {
      console.log(`trade-update:${nextProps.trade.id}`)
      // subscribe(`trade-update:${nextProps.trade.id}`, () => {
      //   this.props.getTrade(nextProps.trade.id);
      // })
    }
  }
  acceptBroker(broker){
    console.log(broker)
    this.props.confirmPrice(
      this.props.trade,
      broker
    );
    this.setState({
      [broker.id]: 1
    })
    subscribeOnce(`trade-investor-confirm:${this.props.trade.id}`, (brokerId) => {
      this.props.getTrade(this.props.trade.id)
      this.setState({
        [brokerId]: 0
      })
    });
  }
  render() {
    return(
      <Col>
        <Table>
          <tbody>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
            {
              (this.props.trade.tradeBrokers||[]).map((ob, index) => {
                let thirdCol = null;
                if(this.props.trade.state >= 3) {
                }else if(ob.priceDecrypted) {
                  if(this.props.trade.broker){
                    if(this.props.trade.broker.id == ob.broker.id && this.props.trade.state === 0){
                      thirdCol = (<span style={{'color': 'green'}}>Accepted, waiting for broker to confirm</span>)
                    }else{
                      thirdCol = (<span style={{'color': 'green'}}>Confirmed by broker</span>)
                    }
                  }else{
                    thirdCol = (<Button 
                      color="success"
                      onClick={() => this.acceptBroker(ob.broker)}>
                      Accept
                    </Button>)
                  }
                }
                return ( 
                  <tr key={index} className='pointer'>
                    <td> {ob.broker.name} </td>
                    <td> {ob.priceDecrypted ? ob.priceDecrypted : 'Waiting for quotes'} </td>
                    <td> {thirdCol} </td>
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </Col>
    )
  }
}

export default TradeBrokers
