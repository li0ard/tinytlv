import { adjustTag, adjustValue, bytesToHex, getBufferLength, hexToBytes } from "./utils";

/** TLV class */
export class TLV {
    /** Tag (as hex) */
    tag: string
    /** Length */
    length: number
    /** Value (as hex) */
    value: string
    /** Value (as Uint8Array) */
    byteValue: Uint8Array
    /** Childs */
    childs: TLV[]
    /** Parent object */
    parent: TLV | null = null
    /** Is constructed or primitive? */
    isConstructed: boolean
    /** Combined length of tag, length and value field */
    size: number

    /**
     * Initialize TLV object
     * @param tag Tag
     * @param value Value
     * @example new TLV('84', '325041592E5359532E4444463031');
     */
    constructor(tag: string | number, value: string | Uint8Array) {
        this.tag = adjustTag(tag)
        this.value = adjustValue(value);
        this.length = this.value.length / 2;
        this.byteValue = hexToBytes(this.value);
        this.childs = [];

        let bTag = hexToBytes(this.tag);
        this.size = bTag.length + getBufferLength(this.length).length + this.byteValue.length;

        if ((bTag[0] & 0x20) === 0x00) {
            this.isConstructed = false;
        } else {
            this.isConstructed = true;
        }

        let offset = 0;
        if (this.isConstructed) {
            while (offset < this.length) {
                let child = TLV.parse(this.byteValue.slice(offset));
                child.parent = this;
                offset += child.size;
                this.childs.push(child);
            }
        }
    }

    /**
     * Encode TLV as string
     * @returns {string}
     */
    toString(): string {
        let byteLength = getBufferLength(this.length);
        return `${this.tag}${bytesToHex(byteLength)}${this.value}`.toLowerCase();
    }

    /**
     * Encode TLV as Uint8Array
     * @returns {Uint8Array}
     */
    toBytes(): Uint8Array {
        let byteLength = getBufferLength(this.length);
        return hexToBytes(`${this.tag}${bytesToHex(byteLength)}${this.value}`);
    }

    /**
     * Find `tag` in childs of main object
     * @param tag Tag to find
     * @returns {TLV | undefined}
     */
    find(tag: string | number): TLV | undefined {
        let upperTAG = adjustTag(tag);

        for(let child of this.childs) {
            if (child.tag === upperTAG) {
                return child;
            }

            if (child.isConstructed) {
                let tlv = child.find(tag);
                if (tlv !== undefined) {
                    return tlv;
                }
            }
        }
    }

    /**
     * Find all `tag`'s in childs of main object
     * @param tag Tag to find
     * @returns {TLV[]}
     */
    findAll(tag: string | number): TLV[] {
        let upperTAG = adjustTag(tag);
        let results: TLV[] = [];

        for (let child of this.childs) {
            if (child.tag === upperTAG) {
                results.push(child);
            }

            if (child.isConstructed) {
                let tlv = child.findAll(tag);
                if (tlv.length !== 0) {
                    results = results.concat(tlv);
                }
            }
        }
        return results;
    }

    /**
     * Parse TLV from string or Uint8Array
     * @param data Data to parse
     * @returns {TLV}
     */
    static parse(data: string | Uint8Array): TLV {
        let buf: Uint8Array;
        if(typeof data === 'string') {
            buf = hexToBytes(data);
        } else {
            buf = data;
        }

        let tag: string;
        let tagLength: number = 1;
        let length: number;
        let byteLength: number;

        if ((buf[0] & 0x1f) === 0x1f) {
            let idx = 1;
            do {
                tagLength++;
                if (idx > 4) {
                    throw Error("Invalid tag length");
                }
            } while ((buf[idx++] & 0x80) === 0x80);
        }

        tag = bytesToHex(buf.slice(0, tagLength));
        let lenOffset = tagLength;

        if ((buf[lenOffset] & 0x80) === 0x80) {
            byteLength = (buf[lenOffset] & 0x7f) + 1;
        } else {
            byteLength = 1;
        }

        if (byteLength === 1) {
            length = buf[lenOffset];
        } else if (byteLength === 2) {
            length = buf[lenOffset + 1];
        } else if (byteLength === 3) {
            length = (buf[lenOffset + 1] << 8) | buf[lenOffset + 2];
        } else if (byteLength === 4) {
            length = (buf[lenOffset + 1] << 16) | (buf[lenOffset + 2] << 8) | buf[lenOffset + 3];
        } else if (byteLength === 5) {
            length = (buf[lenOffset + 1] << 24) | (buf[lenOffset + 2] << 16) | (buf[lenOffset + 3] << 8) | buf[lenOffset + 4];
        } else {
            throw Error("Invalid length: " + byteLength);
        }

        return new TLV(tag, buf.slice(tagLength + byteLength, tagLength + byteLength + length));
    }
}