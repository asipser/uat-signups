import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Table } from "react-bootstrap";
import { Link } from "@reach/router";

let socket;

class StudentHome extends Component {
  constructor(props) {
    super(props);
    this.state = { events: [], loading: true };
  }

  componentDidMount() {
    let url = `${document.domain}`;
    url += location.port ? `:${location.port}` : "";
    socket = socketIOClient(url);

    socket.emit("events", {}, allEvents => {
      this.setState({ events: allEvents, loading: false });
    });
  }

  render() {
    const { events, loading } = this.state;
    if (loading) {
      return <div>Loading!</div>;
    }

    return (
      <div>
        <h1>6.UAT Signup Portal Home</h1>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Event Name</th>
              <th>Link to Signup</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td>{index}</td>
                <td>{event.title}</td>
                <td>
                  <Link to={`/event/${event._id}`}>{"Click me!"}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default StudentHome;
