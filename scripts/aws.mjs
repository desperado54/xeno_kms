import {
    KmsKeyringNode,
    buildClient,
    CommitmentPolicy
  } from '@aws-crypto/client-node'

import fs from 'fs';

/* This builds the client with the REQUIRE_ENCRYPT_REQUIRE_DECRYPT commitment policy,
  * which enforces that this client only encrypts using committing algorithm suites
  * and enforces that this client
  * will only decrypt encrypted messages
  * that were created with a committing algorithm suite.
  * This is the default commitment policy
  * if you build the client with `buildClient()`.
  */
const { encrypt, decrypt } = buildClient(
  CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
)

async function seal() {
  /* A KMS CMK is required to generate the data key.
    * You need kms:GenerateDataKey permission on the CMK in generatorKeyId.
    */
  const generatorKeyId =
    'arn:aws:kms:ap-northeast-1:782765153757:alias/pk1'

  /* Adding alternate KMS keys that can decrypt.
    * Access to kms:Encrypt is required for every CMK in keyIds.
    * You might list several keys in different AWS Regions.
    * This allows you to decrypt the data in any of the represented Regions.
    * In this example, I am using the same CMK.
    * This is *only* to demonstrate how the CMK ARNs are configured.
    */
  const keyIds = [
    'arn:aws:kms:ap-northeast-1:782765153757:key/11616ce0-79bd-4fe1-a79e-12e04d3e57a4',
  ]

  /* The KMS keyring must be configured with the desired CMKs */
  const keyring = new KmsKeyringNode({ generatorKeyId, keyIds })

  /* Encryption context is a *very* powerful tool for controlling and managing access.
    * It is ***not*** secret!
    * Encrypted data is opaque.
    * You can use an encryption context to assert things about the encrypted data.
    * Just because you can decrypt something does not mean it is what you expect.
    * For example, if you are are only expecting data from 'us-west-2',
    * the origin can identify a malicious actor.
    * See: https://docs.aws.amazon.com/encryption-sdk/latest/developer-guide/concepts.html#encryption-context
    */
  const context = {
    stage: 'demo',
    purpose: 'simple demonstration app',
    origin: 'us-west-2',
  }

  /* Find data to encrypt.  A simple string. */
  const path = process.argv[2];

  var blob = fs.readFileSync(path);
  
  // /* Encrypt the data. */
  const { result } = await encrypt(keyring, blob, {
    encryptionContext: context,
  })

  fs.writeFileSync('/Users/heshufendf/Documents/workspace/xeno_kms/env/pk111.blob', result);

  const buffer = fs.readFileSync('/Users/heshufendf/Documents/workspace/xeno_kms/env/pk111.blob');
  /* Decrypt the data. */
  const { plaintext, messageHeader } = await decrypt(keyring, buffer);
  const pk = plaintext.toString();
  /* Grab the encryption context so you can verify it. */
  const { encryptionContext } = messageHeader

  Object.entries(context).forEach(([key, value]) => {
    if (encryptionContext[key] !== value)
      throw new Error('Encryption Context does not match expected values')
  })

  fs.writeFileSync('/Users/heshufendf/Documents/workspace/xeno_kms/env/pk222.blob', plaintext);

  
  /* Return the values so the code can be tested. */
  //console.log({ pk, messageHeader });
}


  
(async() => {
    await seal();
})();