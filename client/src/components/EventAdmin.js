import React, { Component } from "react";
import { Link } from "@reach/router";
import {
  Container,
  Button,
  FormControl,
  Modal,
  Form,
  Table,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { FaEdit, FaTrash, FaCopy } from "react-icons/fa";

import PacmanLoader from "react-spinners/BarLoader";
import socketIOClient from "socket.io-client";
let socket;

class EventAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      showModal: false,
      selectedEvent: null,
      modalMode: "create",
      events: []
    };
  }

  upsert = (title, description, id) => {
    const { events } = this.state;
    let event;
    if (id) {
      const oldEvent = events[events.findIndex(e => e._id === id)];
      oldEvent.title = title;
      oldEvent.description = description;
      event = oldEvent;
    } else {
      event = {
        title: title,
        description: description,
        signups: []
      };
    }
    socket.emit("upsert_event", event);
  };

  delete = id => {
    if (confirm("Are you sure you want to delete this event?")) {
      socket.emit("delete_event", id);
    }
  };

  duplicate = id => {
    socket.emit("duplicate_event", id);
  };

  showModal = id => {
    if (id) {
      this.setState({
        showModal: true,
        modalMode: "edit",
        selectedEvent: this.state.events.find(e => e._id === id)
      });
    } else {
      this.setState({
        showModal: true,
        modalMode: "create"
      });
    }
  };

  copyText = eventId => {
    let url = `${location.protocol}//${document.domain}`;
    url += location.port ? `:${location.port}` : "";
    url += `/event/${eventId}`;
    copyToClipboard(url);
    document.getElementById(eventId + "-button").innerHTML =
      "Copied Student Link to Clipboard!";
    setTimeout(() => {
      document.getElementById(eventId + "-button").innerHTML =
        "Copy Student Link To Clipboard";
    }, 2000);
    //show toast
  };

  componentDidMount() {
    let url = `${document.domain}`;
    url += location.port ? `:${location.port}` : "";
    socket = socketIOClient(url);

    socket.emit("events", {}, allEvents => {
      this.setState({ events: allEvents, loading: false });
    });

    socket.on("upsert-event", newEvent => {
      const { events } = this.state;
      if (events.findIndex(e => e._id === newEvent._id) !== -1) {
        this.setState({
          events: this.state.events.map(e =>
            e._id === newEvent._id ? newEvent : e
          )
        });
      } else {
        this.setState({
          events: [...this.state.events, newEvent]
        });
      }
    });

    socket.on("delete-event", eventId => {
      this.setState({
        events: this.state.events.filter(e => e._id !== eventId)
      });
    });
  }

  render() {
    return (
      <div>
        <PacmanLoader
          sizeUnit={"px"}
          size={150}
          color={"#123abc"}
          loading={this.state.loading}
        />
        {!this.state.loading && (
          <div>
            <h1>6.UAT Signup Portal Staff Home</h1>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th># Total Students Registered</th>
                  <th>Staff Link</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.events.map((event, index) => (
                  <tr key={index}>
                    <td>{index}</td>
                    <td>
                      {event.signups
                        .map(signup => signup.students)
                        .reduce((prev, curr) => {
                          return prev + curr.length;
                        }, 0)}
                    </td>
                    <td>
                      <Link to={`/event/${event._id}/staff`}>
                        {event.title || "Event"}
                      </Link>
                    </td>
                    <td>
                      {wrapTooltip(
                        "Duplicate Event",
                        <FaCopy
                          className="pointer mr-3"
                          size={24}
                          onClick={() => this.duplicate(event._id)}
                        />
                      )}
                      {wrapTooltip(
                        "Edit Event",
                        <FaEdit
                          className="pointer mr-3"
                          size={24}
                          onClick={() => this.showModal(event._id)}
                        />
                      )}
                      {wrapTooltip(
                        "Delete Event",
                        <FaTrash
                          className="pointer mr-3"
                          size={24}
                          onClick={() => this.delete(event._id)}
                        />
                      )}
                      <button
                        id={event._id + "-button"}
                        onClick={() => this.copyText(event._id)}
                      >
                        Copy Student Link To Clipboard
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button className="mt-3 w-100" onClick={() => this.showModal()}>
              Add Event
            </Button>
          </div>
        )}

        <EventModal
          show={this.state.showModal}
          mode={this.state.modalMode}
          upsert={this.upsert}
          title={this.state.selectedEvent ? this.state.selectedEvent.title : ""}
          description={
            this.state.selectedEvent ? this.state.selectedEvent.description : ""
          }
          eventId={
            this.state.selectedEvent ? this.state.selectedEvent._id : undefined
          }
          onHide={() =>
            this.setState({ showModal: false, selectedEvent: null })
          }
        />
      </div>
    );
  }
}

export default EventAdmin;

export const EventModal = props => {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.mode === "edit" ? "Edit" : "Create"} Event
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <FormControl
            id="title"
            defaultValue={props.title}
            placeholder="Enter Title Here"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <FormControl
            id="description"
            defaultValue={props.description}
            placeholder="Event Description"
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
            props.upsert(
              document.getElementById("title").value,
              document.getElementById("description").value,
              props.eventId
            );
            props.onHide();
          }}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

function copyToClipboard(text) {
  //https://stackoverflow.com/questions/33855641/copy-output-of-a-javascript-variable-to-the-clipboard
  var dummy = document.createElement("textarea");
  // to avoid breaking orgain page when copying more words
  // cant copy when adding below this code
  // dummy.style.display = 'none'
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

function wrapTooltip(text, icon) {
  return (
    <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>{icon}</OverlayTrigger>
  );
}
