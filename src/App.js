import "./App.sass";
import React, { useState, useRef } from "react";
import aesjs from "aes-js";

const modes = {
  CTR: "CTR",
  CBC: "CBC",
  CBF: "CBF",
  OFB: "OFB",
  ECB: "ECB",
};
const operations = {
  encrypt: "encrypt",
  decrypt: "decrypt",
};

function App() {
  const [text, setText] = useState("");
  const [processedText, setProcessedText] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [operation, setOperation] = useState(operations.encrypt); // [encrypt, decrypt]
  const [mode, setMode] = useState(modes.CTR);
  const encBtnRef = useRef(null);
  const decBtnRef = useRef(null);

  const handleInput = (e) => {
    setText(e.target.value);
  };

  const handleMode = (e) => {
    setMode(e.target.value);
  };

  const handleOperation = (value) => {
    if (value === operations.encrypt) {
      encBtnRef.current.classList.add("active");
      decBtnRef.current.classList.remove("active");
    } else {
      encBtnRef.current.classList.remove("active");
      decBtnRef.current.classList.add("active");
    }
    setOperation(value);
    // setProcessedText("");
    // setText(processedText);
  };

  const handleSubmit = (mode, operation, text) => {
    if (!isValid(mode, text)) return false;

    if (operation === operations.encrypt) encrypt(mode, text);
    else decrypt(mode, text);
  };
  const isValid = (mode, text) => {
    if (text === "") {
      alert("Please enter text");
      return false;
    }

    if ((mode === modes.CBC || mode === modes.ECB) && text.length % 16 !== 0) {
      alert("Please enter text with length of multiple of 16");
      return false;
    }
    return true;
  };

  const returnOperationMode = (mode) => {
    switch (mode) {
      case modes.CTR:
        console.log("CTR");
        return new aesjs.ModeOfOperation.ctr(JSON.parse(process.env.REACT_APP_KEY256), new aesjs.Counter(5));
      case modes.CBC:
        return new aesjs.ModeOfOperation.cbc(JSON.parse(process.env.REACT_APP_KEY256), JSON.parse(process.env.REACT_APP_IV));
      case modes.CBF:
        return new aesjs.ModeOfOperation.cfb(JSON.parse(process.env.REACT_APP_KEY256), JSON.parse(process.env.REACT_APP_IV), 1);
      case modes.OFB:
        return new aesjs.ModeOfOperation.ofb(JSON.parse(process.env.REACT_APP_KEY256), JSON.parse(process.env.REACT_APP_IV));
      case modes.ECB:
        return new aesjs.ModeOfOperation.ecb(JSON.parse(process.env.REACT_APP_KEY256));
      default:
        return new aesjs.ModeOfOperation.ctr(JSON.parse(process.env.REACT_APP_KEY256), new aesjs.Counter(5));
    }
  };

  const encrypt = (mode, text) => {
    try {
      const textBytes = aesjs.utils.utf8.toBytes(text); // convert text to bytes
      const encMode = returnOperationMode(mode); // return operation(enc or dec) mode
      const encryptedBytes = encMode.encrypt(textBytes); // encrypt bytes
      const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes); // convert bytes to hex

      setProcessedText(encryptedHex);
      setIsEncrypted(true);
    } catch (error) {
      alert("Please enter valid text");
    }
  };

  const decrypt = (mode, text) => {
    try {
      const encryptedBytes = aesjs.utils.hex.toBytes(text); // convert hex to bytes
      const decMode = returnOperationMode(mode); // return operation(enc or dec) mode
      const decryptedBytes = decMode.decrypt(encryptedBytes); // decrypt bytes
      const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes); // convert bytes to text

      setProcessedText(decryptedText);
      setIsEncrypted(true);
    } catch (error) {
      alert("Please enter valid hex");
    }
  };
  return (
    <div className="container">
      <div className="encrypter">
        <div className="options">
          <button
            className="active"
            onClick={() => handleOperation(operations.encrypt)}
            ref={encBtnRef}
          >
            Encrypt
          </button>
          <button
            onClick={() => handleOperation(operations.decrypt)}
            ref={decBtnRef}
          >
            Decrypt
          </button>
        </div>

        <div className="entered-text">
          <textarea
            cols="30"
            rows="10"
            placeholder="enter text"
            value={text}
            onChange={handleInput}
          />
        </div>

        <div className="submit">
          <select datatype="test" onChange={handleMode}>
            <option value={modes.CTR}>{modes.CTR}</option>
            <option value={modes.CBC}>{modes.CBC}</option>
            <option value={modes.CBF}>{modes.CBF}</option>
            <option value={modes.OFB}>{modes.OFB}</option>
            <option value={modes.ECB}>{modes.ECB}</option>
          </select>
          <button onClick={() => handleSubmit(mode, operation, text)}>
            {operation}
          </button>
        </div>

        <div className="encrypted-text">
          <textarea
            value={isEncrypted ? processedText : ""}
            placeholder="Encyrpted text will appear here"
            cols={30}
            rows={10}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
