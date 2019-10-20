/* global fetch */

import { all, call, delay, fork, put, take, takeLatest } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import es6promise from 'es6-promise'
import 'isomorphic-unfetch'

import { actionTypes, failure, loadDataSuccess, tickClock } from './actions'

es6promise.polyfill()

function * runClockSaga () {
  yield take(actionTypes.START_CLOCK)
  while (true) {
    yield put(tickClock(false))
    yield delay(1000)
  }
}

function * loadDataSaga () {
  try {
    const res = yield fetch('https://jsonplaceholder.typicode.com/users')
    const data = yield res.json()
    yield put(loadDataSuccess(data))
  } catch (err) {
    yield put(failure(err))
  }
}

function createChannel() {
   return eventChannel(emit => {
      console.log('start')

      setTimeout(() => {
         emit('TEST')
      }, 2000)

      return () => console.log('Done')
    })
}

function* watchChannel() {
   const channel = yield call(createChannel)

   while (true) {
      const action = yield take(channel)
      console.log('take: ', action)
   }
}

function * rootSaga () {
  yield all([
    call(runClockSaga),
    takeLatest(actionTypes.LOAD_DATA, loadDataSaga),
    fork(watchChannel)
  ])
}

export default rootSaga
