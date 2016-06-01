const firebase = require('firebase')
const {values, omit} = require('lodash')
const choo = require('choo')
const app = choo()

const config = {
  apiKey: 'AIzaSyA8gvFmLJI0m7FoEh_TyuLyfRBWsxkPHqI',
  authDomain: 'tim-election-results.firebaseapp.com',
  databaseURL: 'https://tim-election-results.firebaseio.com',
  storageBucket: 'tim-election-results.appspot.com'
}
const firebaseApp = firebase.initializeApp(config)

app.model({
  state: {
    races: {}
  },
  subscriptions: [
    (send) => firebaseApp.database().ref('races').on('child_changed', (snapshot) => {
      send('update', {key: snapshot.key, payload: snapshot.val()})
    }),
    (send) => firebaseApp.database().ref('races').on('child_added', (snapshot) => {
      send('update', {key: snapshot.key, payload: snapshot.val()})
    }),
    (send) => firebaseApp.database().ref('races').on('child_removed', (snapshot) => {
      send('remove', {key: snapshot.key})
    })
  ],
  reducers: {
    load: (action, state) => ({races: action.payload}),
    update: (action, state) => {
      return {races: Object.assign({}, state.races, {[action.key]: action.payload})}
    },
    remove: (action, state) => ({races: omit(state.races, action.key)})
  }
})

const view = (params, state, send) => choo.view`
  <main>
    <h1>Who won</h1>
    <div class="races">
    ${values(state.races).map((race) => choo.view`
      <div class="race">
        <h3>
          ${race.name}
          <small>${race.percent_completed}% collected</small>
        </h3>
        <table>
          <tbody>
          ${race.candidates.map((candidate) => choo.view`
            <tr>
              <td>${candidate.name}</td>
              <td>${candidate.votes} (${candidate.percent_of_total}%)</td>
            </tr>
          `)}
          </tbody>
        </tbody>
      </div>
    `)}
    </div>
  </main>
`

app.router((route) => [
  route('/', view)
])

const tree = app.start()
document.body.appendChild(tree)
