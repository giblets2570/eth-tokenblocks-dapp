import React from 'react';
import {Table} from 'reactstrap';

export default class FundCharges extends React.Component {
  render(){
    return (
      <Table responsive>
        <tr>
          <th>Charge type</th>
          <th>Number of events</th>
          <th>Charge per event</th>
          <th>Total charge</th>
        </tr>
        <tr>
          <td>Contract notes</td>
          <td>0</td>
          <td>£0.10</td>
          <td>£{(0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Dividend payments</td>
          <td>0</td>
          <td>£0.01</td>
          <td>£0</td>
        </tr>
        <tr>
          <td>Document disemination</td>
          <td>0</td>
          <td>£0.20</td>
          <td>£{0}</td>
        </tr>
        <tr>
          <td>Cash reconciliation</td>
          <td>0</td>
          <td>£0.01</td>
          <td>£{0}</td>
        </tr>
        <tr>
          <td>Emails sent</td>
          <td>0</td>
          <td>£0.001</td>
          <td>£{0}</td>
        </tr>
      </Table>
    )
  }
}
