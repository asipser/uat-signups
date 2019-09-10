import React from "react";
import "../css/app.css";
import EventViewer from "./EventViewer";
import EventAdmin from "./EventAdmin";

import { Router } from "@reach/router";
import { Container } from "react-bootstrap";

const App = () => (
  <Container className="mt-5 text-center">
    <Router>
      <EventAdmin path="/events/staff" />
      <EventViewer path="event/:eventId/:status" />
    </Router>
  </Container>
);

export default App;
