import { } from 'dotenv/config';

import { KmsKeyringNode, buildClient, CommitmentPolicy } from '@aws-crypto/client-node'

import fs from 'fs';

const getSigners = async (networkId) => {
  const { decrypt } = buildClient(
    CommitmentPolicy.FORBID_ENCRYPT_ALLOW_DECRYPT
  )

  const generatorKeyId = process.env.KMS_GENERATOR_KEY_ID;

  const keyIds = [
    process.env.KMS_KEY_ID
  ]

  const keyring = new KmsKeyringNode({ generatorKeyId, keyIds })
  const context = {
    stage: 'prod',
    purpose: 'restore',
    origin: 'ap-northeast-1',
  }


  const pks = [];
  const ksp = process.env[`KEY_STORE_PATH_${networkId}`];
  if(ksp) {
    const blobPaths = ksp.split(',');
    for(let k = 0; k < blobPaths.length; k++) {
      var buffer = fs.readFileSync(blobPaths[k]);
      const { plaintext, messageHeader } = await decrypt(keyring, buffer);
      pks.push(plaintext.toString("base64"));
    }
  }
  
  return {"pks":pks};
} 

export {getSigners}
