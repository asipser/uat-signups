import React from "react";
import "../css/app.css";
import EventViewer from "./EventViewer";
import EventAdmin from "./EventAdmin";
import StudentHome from "./StudentHome";

import { Router } from "@reach/router";
import { Container } from "react-bootstrap";

const App = () => (
  <Container className="pt-5 text-center">
    <Router>
      <StudentHome default />
      <EventAdmin path="/events/staff" />
      <EventViewer path="event/:eventId/:status" />
      <EventViewer path="event/:eventId" />
    </Router>
  </Container>
);

export default App;
