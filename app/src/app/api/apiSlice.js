import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { BASE_URL } from '../../constants'
import { setCredentials } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) headers.set('authorization', `Bearer ${token}`)
    return headers
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  console.log(result) // dont forget to remove this
  if (result?.error?.status === 403) {
    console.log('sending refresh token')
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
    if (refreshResult?.data) {
      api.dispatch(setCredentials({ ...refreshResult.data }))
      result = await baseQuery(args, api, extraOptions)
    } else {
      if (refreshResult?.error?.status === 403) {
        refreshResult.error.data.message = 'Your login has expired.'
      }
      return refreshResult
    }
  }
  return result
}
export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  // tagTypes: ['User'],
  endpoints: (builder) => ({})
})
