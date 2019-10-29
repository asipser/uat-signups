import React from "react";
import "../css/app.css";
import Signup, { SignupModal } from "./Signup";
import { FormControl, InputGroup, Button } from "react-bootstrap";
import { DateTime } from "luxon";

import socketIOClient from "socket.io-client";
let socket;

class EventViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUserName: "",
      loading: true,
      creatingSignup: false,
      signups: [],
      title: "",
      description: ""
    };
  }

  _handleKeyDown = e => {
    if (e.key === "Enter") {
      this.setState({ currentUserName: e.target.value });
    }
  };

  componentDidMount() {
    let url = `${document.domain}`;
    url += location.port ? `:${location.port}` : "";
    socket = socketIOClient(url);

    socket.emit("event", { eventId: this.props.eventId }, event => {
      this.setState({
        signups: event.signups,
        title: event.title,
        description: event.description,
        loading: false
      });
    });

    socket.on("join-signup", data => {
      const { signups } = this.state;
      let newSignup =
        signups[signups.findIndex(el => el._id === data.signup_id)];
      let newStudents = newSignup.students.includes(data.name)
        ? newSignup.students
        : [...newSignup.students, data.name];
      newSignup.students = newStudents;

      this.setState({
        signups: signups.map(signup =>
          signup._id === data.signup_id ? newSignup : signup
        )
      });
    });

    socket.on("leave-signup", data => {
      const { signups } = this.state;
      let newSignup =
        signups[signups.findIndex(el => el._id === data.signup_id)];
      let newStudents = newSignup.students.filter(name => name != data.name);
      newSignup.students = newStudents;

      this.setState({
        signups: signups.map(signup =>
          signup._id == data.signup_id ? newSignup : signup
        )
      });
    });

    socket.on("update-signup", response => {
      const newSignups = [...this.state.signups];
      newSignups[
        newSignups.findIndex(el => el._id === response._id)
      ] = response;
      this.setState({
        signups: newSignups
      });
    });

    socket.on("delete-signup", id => {
      const newSignups = [...this.state.signups];
      this.setState({
        signups: newSignups.filter(signup => signup._id !== id)
      });
    });

    socket.on("create-signup", ({ newSignup, eventId }) => {
      console.log(newSignup, eventId);
      if (eventId === this.props.eventId) {
        this.setState({
          signups: [...this.state.signups, newSignup]
        });
      }
    });
  }

  join = (name, signupKey) => {
    socket.emit("join_signup", {
      signup_id: signupKey,
      name: name
    });
  };

  leave = (name, signupKey) => {
    socket.emit("leave_signup", {
      signup_id: signupKey,
      name: name
    });
  };

  duplicate = signupKey => {
    socket.emit("create_signup", { _id: signupKey }, this.props.eventId);
  };

  deleteSignup = signupKey => {
    if (confirm("Are you sure you want to delete this signup?")) {
      socket.emit("delete_signup", { _id: signupKey }, this.props.eventId);
    }
  };

  update = (
    signupId,
    newMaxStudents,
    newTa,
    newStart,
    newDescription,
    newVisibility
  ) => {
    const oldSignup = this.state.signups.find(
      signup => signup._id === signupId
    );
    const newSignup = {
      _id: signupId,
      start_time: newStart,
      ta: newTa,
      description: newDescription,
      viewable: newVisibility,
      students: oldSignup.students,
      locked: oldSignup.locked,
      max_signups: newMaxStudents
    };
    socket.emit("update_signup", newSignup);
  };

  create = (newMaxStudents, newTa, newStart, newDescription) => {
    const newSignup = {
      start_time: newStart,
      ta: newTa,
      description: newDescription,
      viewable: true,
      students: [],
      locked: false,
      max_signups: newMaxStudents
    };
    socket.emit("create_signup", newSignup, this.props.eventId);
  };

  render() {
    const { currentUserName, loading, description, title } = this.state;
    const { status } = this.props;
    const isAdmin = status === "staff";
    let nextSignupTime = "";
    const signups = [...this.state.signups].sort(compareSignups);
    if (signups.length > 0 && !!signups[signups.length - 1].start_time) {
      nextSignupTime = DateTime.fromISO(
        signups[signups.length - 1].start_time,
        {
          zone: "America/New_York"
        }
      );
      nextSignupTime = nextSignupTime.plus({ hours: 1 });
      nextSignupTime = nextSignupTime.toISO({
        suppressMilliseconds: true,
        suppressSeconds: true,
        includeOffset: false
      });
    }

    console.log(nextSignupTime);

    if (loading) {
      return <div> Loading! </div>;
    }

    return (
      <div>
        <h1 className="text-primary">6.UAT Signups: {title}</h1>
        <h3 className="text-secondary pl-4">{description}</h3>
        {isAdmin ? (
          <Button
            onClick={() => this.setState({ creatingSignup: true })}
            className="btn-block mb-2 mt-2"
            variant="primary"
          >
            Add Signup
          </Button>
        ) : (
          <div>
            {currentUserName === "" ? (
              <InputGroup className="mb-3">
                <InputGroup.Prepend>
                  <InputGroup.Text>Enter your Kerberos to join</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  onKeyDown={this._handleKeyDown}
                  id="name-input"
                  placeholder="Kerberos (without the @mit.edu)"
                  aria-label="Amount (to the nearest dollar)"
                />
                <InputGroup.Append>
                  <Button
                    onClick={() => {
                      this.setState({
                        currentUserName: document.getElementById("name-input")
                          .value
                      });
                    }}
                    variant="outline-secondary"
                  >
                    Submit
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            ) : (
              <h2>
                Welcome <i className="">{currentUserName}</i>
              </h2>
            )}
          </div>
        )}
        {signups.map(signup => {
          return (
            <Signup
              id={signup._id}
              key={signup._id}
              students={signup.students}
              maxSignups={signup.max_signups}
              locked={false}
              ta={signup.ta}
              time={signup.start_time}
              description={signup.description}
              join={this.join}
              leave={this.leave}
              update={this.update}
              remove={this.deleteSignup}
              duplicate={this.duplicate}
              currentStudentName={currentUserName}
              admin={isAdmin}
            />
          );
        })}
        <SignupModal
          ta=""
          description=""
          maxSignups={20}
          time={nextSignupTime}
          show={this.state.creatingSignup}
          onHide={() => this.setState({ creatingSignup: false })}
          create={this.create}
        />
      </div>
    );
  }
}

function compareSignups(signup1, signup2) {
  const date1 = signup1.start_time ? new Date(signup1.start_time) : new Date();
  const date2 = signup2.start_time ? new Date(signup2.start_time) : new Date();

  let comparison = 0;
  if (date1 > date2) {
    comparison = 1;
  } else if (date1 < date2) {
    comparison = -1;
  }
  return comparison;
}

export default EventViewer;
