// This code should be added in app.js file

const saveDataToRealtimeDatabase = async () => {
    const reference = database().ref('/users');
    reference
      .push({
        // Data
      })
      .then(() => {
        console.log('User data saved to Realtime Database!');
      })
      .catch(error => {
        console.log('Error saving data:', error);
      });
  };
  
