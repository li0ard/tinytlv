<p align="center">
    <b>tinytlv</b><br>
    <b>Tiny TLV decoder and encoder</b>
    <br>
    <a href="https://li0ard.is-cool.dev/tinytlv">docs</a>
    <br><br>
    <a href="https://github.com/li0ard/tinytlv/actions/workflows/test.yml"><img src="https://github.com/li0ard/tinytlv/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/li0ard/tinytlv/blob/main/LICENSE"><img src="https://img.shields.io/github/license/li0ard/tinytlv" /></a>
    <br>
    <a href="https://npmjs.com/package/@li0ard/tinytlv"><img src="https://img.shields.io/npm/v/@li0ard/tinytlv" /></a>
    <a href="https://jsr.io/@li0ard/tinytlv"><img src="https://jsr.io/badges/@li0ard/tinytlv" /></a>
    <br>
    <hr>
</p>

## Installation

```bash
# from NPM
npm i @li0ard/tinytlv

# from JSR
bunx i jsr install @li0ard/tinytlv
```

## Usage

```ts
import { TLV } from "@li0ard/tinytlv"

let tlv = TLV.parse("770E8202580094080801010010010301")
console.log(tlv.tag) // 77
console.log(tlv.length) // 14
console.log(tlv.value) // 8202580094080801010010010301
console.log(tlv.toString()) // 770E8202580094080801010010010301
```