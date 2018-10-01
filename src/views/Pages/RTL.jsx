import React from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  CardHeader
} from "reactstrap";
// react plugin used to create switch buttons
import Switch from "react-bootstrap-switch";

import {
  PanelHeader,
  Statistics,
  Stats,
  CardDescription,
  CardStats,
  Timeline,
  CardIcon,
  Button,
  Tasks
} from "components";

import { widgetStoriesRTL, tasksRTL } from "variables/general";

import avatar from "assets/img/james.jpg";

class Widgets extends React.Component {
  constructor(props) {
    super(props);
    document.body.className += " rtl-active";
  }
  componentWillUnmount() {
    document.body.classList.remove("rtl-active");
  }
  render() {
    return (
      <div>
        <PanelHeader />
        <div className="content">
          <Row>
            <Col xs={12} sm={6} md={6} lg={3}>
              <Card className="card-stats">
                <CardBody>
                  <Statistics
                    horizontal
                    rtl
                    icon="ui-2_chat-round"
                    iconState="primary"
                    title="1058"
                    subtitle="رسائل"
                  />
                </CardBody>
                <hr />
                <CardFooter>
                  <Stats rtl>
                    {[
                      {
                        i: "now-ui-icons arrows-1_refresh-69",
                        t: " تحديث الان"
                      }
                    ]}
                  </Stats>
                </CardFooter>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <Card className="card-stats">
                <CardBody>
                  <Statistics
                    horizontal
                    rtl
                    icon="business_bank"
                    iconState="warning"
                    title="$23,685"
                    subtitle="الوديعة"
                  />
                </CardBody>
                <hr />
                <CardFooter>
                  <Stats rtl>
                    {[
                      {
                        i: "now-ui-icons ui-1_calendar-60",
                        t: " الاسبوع الماضى"
                      }
                    ]}
                  </Stats>
                </CardFooter>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <Card className="card-stats">
                <CardBody>
                  <Statistics
                    horizontal
                    rtl
                    icon="sport_user-run"
                    iconState="danger"
                    title="364"
                    subtitle="لاعبين"
                  />
                </CardBody>
                <hr />
                <CardFooter>
                  <Stats rtl>
                    {[
                      {
                        i: "now-ui-icons ui-2_time-alarm",
                        t: " في الساعة الماضية"
                      }
                    ]}
                  </Stats>
                </CardFooter>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={6} lg={3}>
              <Card className="card-stats">
                <CardBody>
                  <Statistics
                    horizontal
                    rtl
                    icon="ui-2_favourite-28"
                    iconState="info"
                    title="+83K"
                    subtitle="متابعون"
                  />
                </CardBody>
                <hr />
                <CardFooter>
                  <Stats rtl>
                    {[
                      {
                        i: "now-ui-icons arrows-1_refresh-69",
                        t: " تحديث الان"
                      }
                    ]}
                  </Stats>
                </CardFooter>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={12} lg={6} className="text-center">
              <Card className="card-contributions">
                <CardBody>
                  <CardTitle tag="h1">3,521</CardTitle>
                  <h3 className="card-category">مجموع المساهمات العامة</h3>
                  <CardDescription>
                    بعد نجاح ناجح لمدة عامين ، سنقوم بتغيير طريقة عمل المساهمات.
                  </CardDescription>
                </CardBody>
                <hr />
                <CardFooter>
                  <Row>
                    <Col xs={6}>
                      <CardStats className="justify-content-center">
                        <Switch onText="ON" offText="OFF" />
                        <span>جميع المساهمات العامة</span>
                      </CardStats>
                    </Col>
                    <Col xs={6}>
                      <CardStats className="justify-content-center">
                        <Switch
                          onText="ON"
                          offText="OFF"
                          defaultValue={false}
                        />
                        <span>مساهمات الأسبوع</span>
                      </CardStats>
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
              <Card className="card-tasks">
                <CardHeader>
                  <h5 className="card-category">تطوير الخلفية</h5>
                  <CardTitle tag="h4">مهام</CardTitle>
                </CardHeader>
                <CardBody>
                  <Tasks tasks={tasksRTL} rtl />
                </CardBody>
                <CardFooter>
                  <hr />
                  <Stats rtl>
                    {[
                      {
                        i: "now-ui-icons loader_refresh spin",
                        t: " تم التحديث منذ 3 دقائق"
                      }
                    ]}
                  </Stats>
                </CardFooter>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-plain card-timeline">
                <CardBody>
                  <Timeline stories={widgetStoriesRTL} simple rtl />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={6}>
              <Row>
                <Col xs={12} lg={6}>
                  <Card className="card-pricing">
                    <h6 className="card-category">حزمة ألفا</h6>
                    <CardBody>
                      <CardIcon
                        color="primary"
                        icon="now-ui-icons objects_diamond"
                      />
                      <CardTitle tag="h3">69$</CardTitle>
                      <ul>
                        <li>مواد العمل في EPS</li>
                        <li>6 أشهر الوصول إلى المكتبة</li>
                      </ul>
                    </CardBody>
                    <CardFooter>
                      <Button href="#pablo" color="primary" round>
                        أضف إلى السلة
                      </Button>
                    </CardFooter>
                  </Card>
                </Col>
                <Col xs={12} lg={6}>
                  <Card className="card-pricing card-plain">
                    <h6 className="card-category">برافو باك</h6>
                    <CardBody>
                      <CardIcon
                        color="warning"
                        icon="now-ui-icons media-1_button-power"
                      />
                      <CardTitle tag="h3">10$</CardTitle>
                      <ul>
                        <li>وثائق كاملة</li>
                        <li>مواد العمل في Sketch</li>
                      </ul>
                    </CardBody>
                    <CardFooter>
                      <Button href="#pablo" color="warning" neutral round>
                        أضف إلى السلة
                      </Button>
                    </CardFooter>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col xs={12} md={6}>
              <Card className="card-testimonial">
                <CardHeader className="card-header-avatar">
                  <a href="#pablo">
                    <img className="img img-raised" src={avatar} alt="..." />
                  </a>
                </CardHeader>
                <CardBody>
                  <CardDescription>
                    إن التشبيك في قمة الويب لا يشبه أي مؤتمر تقني أوروبي آخر.
                  </CardDescription>
                  <div className="icon icon-primary">
                    <i className="fa fa-quote-right" />
                  </div>
                </CardBody>
                <CardFooter>
                  <CardTitle tag="h4">ألتون بيكر</CardTitle>
                  <p className="category">@altonbecker</p>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Widgets;
