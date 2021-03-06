import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Header, Loader, Card } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Restaurants } from '../../api/restaurant/Restaurant';
import Restaurant from '../components/Restaurant';

function isOpen(restaurant, date) {
  const times = [];
  /** All restaurants are closed on weekends */
  if (date.getDay() === 6 || date.getDay() === 0) {
    return false;
  }
  /** Parse serviceHours string and extract hours and min for opening and closing */
  for (let i = 0; i < restaurant.serviceHours.length; i++) {
    let num;
    if (restaurant.serviceHours[i] >= '0' && restaurant.serviceHours[i] <= '9') {
      num = restaurant.serviceHours.charCodeAt(i) - 48;
      if (restaurant.serviceHours[i + 1] >= '0' && restaurant.serviceHours[i + 1] <= '9') {
        num = (restaurant.serviceHours.charCodeAt(i) - 48) * 10 + (restaurant.serviceHours.charCodeAt(i + 1) - 48);
        i++;
      }
      times.push(num);
    }
  }
  console.log(times);
  /** Determine if restaurant closed and if its not return that its open */
  /** Restaurant is hour(s) away from being open */
  if (date.getHours() < times[0] || restaurant.serviceHours === 'Closed') {
    return false;
  }
  /** Restaurant is minute(s) away from being open */
  if (times[0] === date.getHours() && times[1] > date.getMinutes()) {
    return false;
  }
  /** Restaurant closed hour(s) ago */
  if (date.getHours() > (times[2] + 12)) {
    return false;
  }
  /** Restaurant closed minutes(s) ago */
  return !((times[2] + 12) === date.getHours() && times[3] < date.getMinutes());

}

/** Renders a table containing all of the Stuff documents. Use <StuffItem> to render each row. */
class AvailableRestaurants extends React.Component {

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  /** Render the page once subscriptions have been received. */
  renderPage() {
    const d = new Date();
    const available = []; /** if restaurant is both open and not closed */
    console.log(d.getHours());
    for (let i = 0; i < this.props.restaurants.length; i++) {
      if (isOpen(this.props.restaurants[i], d)) {
        available.push(this.props.restaurants[i]);
      }
    }

    if (available.length > 0) {
      return (
          <Container id="availablerestaurants-page">
            <Header as="h2" textAlign="center">Whats Open Now</Header>
            <Card.Group centered>{available.map((restaurants, index) => <Restaurant
                key={index}
                restaurant={restaurants}/>)}
            </Card.Group>
          </Container>
      );
    }
    return (
        <Container id="availablerestaurants-page">
          <Header as="h2" textAlign="center">Whats Open Now</Header>
          <Header as="h3" textAlign="center" color="red">Closed For The Day!</Header>
        </Container>
    );
  }
}

/** Require an array of Stuff documents in the props. */
AvailableRestaurants.propTypes = {
  restaurants: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
export default withTracker(() => {
  // Get access to Stuff documents.
  const subscription = Meteor.subscribe(Restaurants.userPublicationName);
  return {
    restaurants: Restaurants.collection.find({}).fetch(),
    ready: subscription.ready(),
  };
})(AvailableRestaurants);
