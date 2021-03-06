import React, { Component } from "react";
import PropTypes from "prop-types";
import { DateTime } from "luxon";
import {
  Accordion,
  Card,
  Container,
  Row,
  Button,
  Col,
  FormControl,
  Modal,
  Form,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { FaEdit, FaTrash, FaCopy, FaMailBulk } from "react-icons/fa";

/**
 * @augments {Component<{  admin:boolean,  id:string,  currentStudentName:string.isRequired,  locked:boolean.isRequired,  students:array,  maxSignups:number.isRequired,  ta:string,  time:string,  description:string,  join:Function.isRequired,  leave:Function.isRequired,  update:Function.isRequired,  duration:number>}
 */
class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = { editing: false };
  }

  generateEmail = () => {
    const mailto = this.props.students.map(s => `${s}@mit.edu`).join(",");
    window.open(`mailto:${mailto}`);
  };

  componentDidMount() {}

  render() {
    const unstyledButton = {
      width: "100%",
      background: "none",
      color: "inherit",
      border: "none",
      padding: 0,
      font: "inherit",
      cursor: "pointer",
      outline: "inherit"
    };
    const {
      locked,
      students,
      maxSignups,
      ta,
      time,
      description,
      currentStudentName,
      admin,
      leave,
      join,
      duplicate,
      remove,
      id
    } = this.props;
    const { editing } = this.state;
    const studentNames = new Set(students.map(s => s.toLowerCase()));
    const eventCapacity =
      students.length >= maxSignups
        ? "full"
        : students.length >= maxSignups / 2
        ? "partial"
        : "open";

    const signupTime =
      time && time.length > 0
        ? DateTime.fromISO(time, {
            zone: "America/New_York"
          }).toLocaleString({
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })
        : "";
    return (
      <div>
        <Accordion className="border-bottom">
          <Card>
            <Card.Header>
              <Container>
                <Row>
                  <Col xs={8}>
                    <Accordion.Toggle eventKey="0" style={unstyledButton}>
                      <Container>
                        <Row>
                          <Col xs={2}>
                            <div className={eventCapacity}>
                              {students.length} / {maxSignups}
                            </div>
                          </Col>
                          {!!signupTime && <Col xs={4}>{signupTime}</Col>}
                          {!!ta && <Col>{ta}</Col>}
                          {!!description && <Col>{description}</Col>}
                        </Row>
                      </Container>
                    </Accordion.Toggle>
                  </Col>
                  {admin ? (
                    <Col>
                      <Container>
                        <Row>
                          <Col>
                            {wrapTooltip(
                              "Edit Signup",
                              <FaEdit
                                className="pointer"
                                size={24}
                                onClick={() => this.setState({ editing: true })}
                              />
                            )}
                          </Col>
                          <Col>
                            {wrapTooltip(
                              "Delete Signup",
                              <FaTrash
                                className="pointer"
                                size={24}
                                onClick={() => remove(id)}
                              />
                            )}
                          </Col>
                          <Col>
                            {wrapTooltip(
                              "Duplicate Signup",
                              <FaCopy
                                className="pointer"
                                size={24}
                                onClick={() => duplicate(id)}
                              />
                            )}
                          </Col>
                          <Col>
                            {wrapTooltip(
                              "Generate Email to Students",
                              <FaMailBulk
                                className="pointer"
                                size={24}
                                onClick={this.generateEmail}
                              />
                            )}
                          </Col>
                        </Row>
                      </Container>
                    </Col>
                  ) : (
                    <Col>
                      {studentNames.has(currentStudentName.toLowerCase()) ? (
                        <Button
                          variant="danger"
                          onClick={() => leave(currentStudentName, id)}
                        >
                          Leave
                        </Button>
                      ) : (
                        <JoinButton
                          isFull={eventCapacity === "full"}
                          locked={locked}
                          hasEnteredName={currentStudentName !== ""}
                          joinSignup={() => join(currentStudentName, id)}
                        />
                      )}
                    </Col>
                  )}
                </Row>
              </Container>
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                <Container>
                  {this.props.students.length === 0
                    ? "Empty section!"
                    : this.props.students.map((name, index) => (
                        <Row key={index}>
                          <Col>{name}</Col>
                          {admin && (
                            <Col>
                              <Button
                                className="mb-2"
                                variant="danger"
                                size="sm"
                                onClick={() => leave(name, id)}
                              >
                                Remove
                              </Button>
                            </Col>
                          )}
                        </Row>
                      ))}
                </Container>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
        <SignupModal
          {...{ ...this.props, mode: "edit" }}
          show={editing}
          onHide={() => this.setState({ editing: false })}
        />
      </div>
    );
  }
}

Signup.propTypes = {
  admin: PropTypes.bool,
  id: PropTypes.string,
  currentStudentName: PropTypes.string.isRequired,
  locked: PropTypes.bool.isRequired,
  students: PropTypes.array,
  maxSignups: PropTypes.number.isRequired,
  ta: PropTypes.string,
  time: PropTypes.string,
  description: PropTypes.string,
  join: PropTypes.func.isRequired,
  leave: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
  duration: PropTypes.number
};

export default Signup;

export const SignupModal = props => {
  let dateString = "";
  if (props.time) {
    dateString = DateTime.fromISO(props.time, {
      zone: "America/New_York"
    }).toISO({
      suppressMilliseconds: true,
      suppressSeconds: true,
      includeOffset: false
    });
  }
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.mode === "edit" ? "Edit" : "Create"} Signup
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Max Students</Form.Label>
          <FormControl
            id="max"
            placeholder="Enter # of Max Students"
            defaultValue={props.maxSignups}
            type="number"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Start Time</Form.Label>
          <FormControl
            id="start"
            type="datetime-local"
            defaultValue={dateString}
            placeholder="New start"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>TA</Form.Label>
          <FormControl id="ta" defaultValue={props.ta} placeholder="New TA" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <FormControl
            id="description"
            defaultValue={props.description}
            placeholder="New Description"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onHide}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            const startTimeStr = document.getElementById("start").value;
            console.log(startTimeStr);
            const startTimeISO = DateTime.fromFormat(
              startTimeStr,
              "yyyy-MM-ddTHH:mm",
              { zone: "America/New_York" }
            ).toISO();
            if (props.mode === "edit") {
              props.update(
                props.id,
                document.getElementById("max").value,
                document.getElementById("ta").value,
                startTimeISO,
                document.getElementById("description").value,
                props.visible
              );
            } else {
              props.create(
                document.getElementById("max").value,
                document.getElementById("ta").value,
                startTimeISO,
                document.getElementById("description").value
              );
            }
            props.onHide();
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const JoinButton = ({ hasEnteredName, isFull, joinSignup, locked }) => {
  if (isFull) {
    return <span className="text-danger">Signup Full</span>;
  } else if (!hasEnteredName) {
    return (
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-disabled">
            Enter a name to join a section!
          </Tooltip>
        }
      >
        <span className="d-inline-block">
          <Button disabled style={{ pointerEvents: "none" }}>
            Join
          </Button>
        </span>
      </OverlayTrigger>
    );
  } else if (locked) {
    return (
      <OverlayTrigger
        overlay={
          <Tooltip id="tooltip-disabled">
            Leave your other section to join this section!
          </Tooltip>
        }
      >
        <span className="d-inline-block">
          <Button disabled style={{ pointerEvents: "none" }}>
            Join
          </Button>
        </span>
      </OverlayTrigger>
    );
  } else {
    return <Button onClick={joinSignup}>Join</Button>;
  }
};

function wrapTooltip(text, icon) {
  return (
    <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>{icon}</OverlayTrigger>
  );
}
