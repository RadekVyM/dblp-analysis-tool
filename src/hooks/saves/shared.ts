import { sendDelete, sendPost } from '@/services/fetch'

export async function sendPostRequest<DataT, ResultT>(url: string, { arg }: { arg: DataT}) {
    return sendPost(url, arg).then(res => res.json() as ResultT)
}

export async function sendDeleteRequest(url: string, { arg }: { arg: any }) {
    return sendDelete(`${url}/${arg}`).then(res => res.text())
}