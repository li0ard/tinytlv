// Code from @noble/hashes/utils.ts

const hexes = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'));
const asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 } as const;
const asciiToBase16 = (ch: number): number | undefined => {
    if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0; // '2' => 50-48
    if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10); // 'B' => 66-(65-10)
    if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10); // 'b' => 98-(97-10)
    return;
}

/**
 * Convert byte array to hex string. Uses built-in function, when available.
 * @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
 */
export const bytesToHex = (bytes: Uint8Array): string => {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
    return hex;
}
/**
 * Convert hex string to byte array. Uses built-in function, when available.
 * @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
 */
export const hexToBytes = (hex: string): Uint8Array => {
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2) throw new Error('hex string expected, got unpadded hex of length ' + hl);

    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
        const n1 = asciiToBase16(hex.charCodeAt(hi));
        const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
        if (n1 === undefined || n2 === undefined) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
        }
        array[ai] = n1 * 16 + n2; // multiply first octet, e.g. 'a3' => 10*16+3 => 160 + 3 => 163
    }
    return array;
}

/**
 * Convert number to hex string
 * @param num Number
 * @returns {string}
 */
export const numberToHex = (num: number): string => {
    let h = num.toString(16);
    if ((h.length & 1) === 1) h = '0' + h;
    return h;
};

/**
 * Adjust tag value to string
 * @param tag Tag
 * @returns {string}
 */
export const adjustTag = (tag: string | number): string => {
    if (typeof tag === 'number') return numberToHex(tag);
    else return numberToHex(parseInt(tag, 16));
}

/**
 * Adjust value to string
 * @param value Value
 * @returns {string}
 */
export const adjustValue = (value: string | Uint8Array): string => {
    if(typeof value === 'string') {
        if ((value.length & 0x01) === 0x01) throw Error("Invalid value length");
        return value;
    }
    else return bytesToHex(value);
}

/**
 * Get TLV length as Uint8Array
 * @param len Length
 * @returns {Uint8Array}
 */
export const getBufferLength = (len: number): Uint8Array => {
    let bLen;

    if (len < 0x80) {
        // 0x00 ~ 0x7f
        bLen = new Uint8Array(1);
        bLen[0] = len;
    } else if (len < 0x0100) {
        // 0x00 ~ 0xff
        bLen = new Uint8Array(2);
        bLen[0] = 0x81;
        bLen[1] = len;
    } else if (len < 0x010000) {
        // 0x0000~0xffff
        bLen = new Uint8Array(3);
        bLen[0] = 0x82;
        bLen[1] = len >>> 8;
        bLen[2] = len;
    } else if (len < 0x01000000) {
        // 0x00000000 to 0x00ffffff
        bLen = new Uint8Array(4);
        bLen[0] = 0x83;
        bLen[1] = len >>> 16;
        bLen[2] = len >>> 8;
        bLen[3] = len;
    } else {
        bLen = new Uint8Array(5);
        bLen[0] = 0x84;
        bLen[1] = len >>> 24;
        bLen[2] = len >>> 16;
        bLen[3] = len >>> 8;
        bLen[4] = len;
    }

    return bLen;
}