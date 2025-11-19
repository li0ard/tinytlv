import { test, expect } from "bun:test";
import { TLV } from "../src";
import { hexToBytes } from "../src/utils";

test("Parsing (GPO response for example)", () => {
    const tlv = TLV.parse("770E8202580094080801010010010301");
    expect(tlv.tag).toBe("77");
    expect(tlv.length).toBe(14);
    expect(tlv.value).toBe("8202580094080801010010010301");
    expect(tlv.toString().toUpperCase()).toBe("770E8202580094080801010010010301");

    const childs = tlv.childs;
    expect(childs.length).toBe(2);
    expect(childs[0].tag).toBe("82");
    
    const aip = tlv.find(0x82);
    expect(aip?.tag).toBe("82");
    expect(aip?.length).toBe(2);
    expect(aip?.value).toBe("5800");
    expect(aip?.toString()).toBe("82025800");

    const afl = tlv.find("94");
    expect(afl?.tag).toBe("94");
    expect(afl?.length).toBe(8);
    expect(afl?.value).toBe("0801010010010301");
    expect(afl?.toString()).toBe("94080801010010010301");
});

test("Encoding (PPSE FCI for example)", () => {
    const df_name = new TLV('84', '325041592E5359532E4444463031');
    const adf_name = new TLV('4F', hexToBytes("A0000000031010"));
    const app_label = new TLV('50', '56495341435245444954');
    const dir_encty = new TLV('61', adf_name.toString()+app_label.toString());
    const issuer_discretionary_data = new TLV('BF0C', dir_encty.toString());
    const fci_proprietary_template = new TLV('A5', issuer_discretionary_data.toString());
    const fci_template = new TLV('6F',  df_name.toString() + fci_proprietary_template.toString());

    expect(fci_template.toString().toUpperCase()).toBe("6F2C840E325041592E5359532E4444463031A51ABF0C1761154F07A0000000031010500A56495341435245444954");
});