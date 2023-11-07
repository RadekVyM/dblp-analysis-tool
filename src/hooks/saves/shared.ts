import { sendDelete, sendPost } from '@/services/fetch'

export async function sendPostRequest<DataT, ResultT>(url: string, { arg }: { arg: { data: DataT, urlParams?: Array<any> } }) {
    return sendPost(`${url}${arg.urlParams ? `/${arg.urlParams.join('/')}` : ''}`, arg.data)
        .then(res => res.json() as ResultT)
}

export async function sendDeleteRequest(url: string, { arg }: { arg: Array<any> }) {
    return sendDelete(`${url}/${arg.join('/')}`)
        .then(res => res.text())
}