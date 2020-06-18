/*
 * Copyright 2020 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as PeerId from "peer-id";
import {encode} from "bs58"
import Url from "url-parse"

export interface Address {
    service: string | undefined,
    protocols: Protocol[]
}

export interface Protocol {
    protocol: ProtocolType,
    value?: string
}

export enum ProtocolType {
    Providers = "providers",
    Peer = "peer",
    Signature = "signature",
    Client = "client"
}

const PROTOCOL = "fluence:";

export function addressToString(address: Address): string {

    let url = new Url("fluence:/");

    let path = "";
    for (let addr of address.protocols) {
        path = path + "/" + addr.protocol;
        if (addr.value) {
            path = path + "/" + addr.value;
        }
    }

    if (path) {
        url.set("pathname", path);
    }

    if (address.service) {
        url.set("hash", address.service);
    }

    return url.toString();
}

function protocolWithValue(protocol: ProtocolType, protocolIterator: IterableIterator<[number, string]>): Protocol {

    let protocolValue = protocolIterator.next().value;

    if (!protocolValue || !protocolValue[1]) {
        throw Error(`protocol '${protocol}' should be with a value`)
    }

    return {protocol: protocol, value: protocolValue[1]};
}


export function parseProtocol(protocol: string, protocolIterator: IterableIterator<[number, string]>): Protocol {
    protocol = protocol.toLocaleLowerCase();

    switch (protocol) {
        case ProtocolType.Providers:
            return protocolWithValue(protocol, protocolIterator);
        case ProtocolType.Client:
            return protocolWithValue(protocol, protocolIterator);
        case ProtocolType.Peer:
            return protocolWithValue(protocol, protocolIterator);
        case ProtocolType.Signature:
            return protocolWithValue(protocol, protocolIterator);
        default:
            throw Error(`cannot parse protocol '${protocol}'. Should be 'peer|client|signature'`);
    }

}

export async function createRelayAddress(relay: string, peerId: PeerId, withSig: boolean): Promise<Address> {

    let protocols = [
        {protocol: ProtocolType.Peer, value: relay},
        {protocol: ProtocolType.Client, value: peerId.toB58String()}
    ];

    if (withSig) {
        let str = addressToString({service: undefined, protocols: protocols}).replace(PROTOCOL, "");
        let signature = await peerId.privKey.sign(Buffer.from(str));
        let signatureStr = encode(signature);

        protocols.push({protocol: ProtocolType.Signature, value: signatureStr});
    }

    return {
        service: undefined,
        protocols: protocols
    }
}

export function createLocalAddress(service: string, address?: Address): Address {

    let protocols: Protocol[];
    if (address) {
        protocols = address.protocols
    } else {
        protocols = [];
    }

    return {
        service: service,
        protocols: protocols
    }
}

export function createServiceAddress(service: string): Address {

    let protocol = {protocol: ProtocolType.Providers, value: service};

    return {
        service: undefined,
        protocols: [protocol]
    }
}

export function createPeerAddress(peer: string): Address {
    let protocol = {protocol: ProtocolType.Peer, value: peer};

    return {
        service: undefined,
        protocols: [protocol]
    }
}

export function parseAddress(str: string): Address {

    let url = new Url(str);
    let service;
    if (url.hash) {
        service = url.hash;
    }

    let path = url.pathname;

    // delete leading slashes
    path = path.replace(/^\/+/, '');

    let parts = path.split("/");
    if (parts.length < 1) {
        throw Error("address parts should not be empty")
    }

    let protocols: Protocol[] = [];
    let partsEntries: IterableIterator<[number, string]> = parts.entries();

    while (true) {
        let result = partsEntries.next();
        if (result.done) break;
        let protocol = parseProtocol(result.value[1], partsEntries);
        protocols.push(protocol);
    }

    return {
        service: service,
        protocols: protocols
    }
}
