import React from "react";
import { Container } from "reactstrap";
// used for making the prop types of this component
import PropTypes from "prop-types";

class Footer extends React.Component {
  render() {
    return (
      <footer
        className={"footer" + (this.props.default ? " footer-default" : "")}
      >
        <Container fluid={this.props.fluid ? true : false}>
          <nav>
            <ul>
              
            </ul>
          </nav>
          <div className="copyright">
            &copy; {1900 + new Date().getYear()} by{" "}
            <a
              href="https://www.tokenblocks.io"
              target="_blank"
              rel="noopener noreferrer"
            >
              TokenBlocks
            </a>.
          </div>
        </Container>
      </footer>
    );
  }
}

Footer.propTypes = {
  default: PropTypes.bool,
  fluid: PropTypes.bool
};

export default Footer;
