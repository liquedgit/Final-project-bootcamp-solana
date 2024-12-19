/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/reddit_app.json`.
 */
export type RedditApp = {
  "address": "AQKAEEkfkgQJcNUXyCiKFpwDt4fKKB1X2M5dX8hGNeP5",
  "metadata": {
    "name": "redditApp",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "commentThread",
      "discriminator": [
        119,
        248,
        226,
        109,
        71,
        68,
        155,
        206
      ],
      "accounts": [
        {
          "name": "commentAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "comment",
          "writable": true
        },
        {
          "name": "thread",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "thread.title [.. thread.title_length as usize]",
                "account": "thread"
              },
              {
                "kind": "const",
                "value": [
                  84,
                  72,
                  82,
                  69,
                  65,
                  68,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "thread.thread_author",
                "account": "thread"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "threadAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "thread",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "const",
                "value": [
                  84,
                  72,
                  82,
                  69,
                  65,
                  68,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "threadAuthority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "tags",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "likeThread",
      "discriminator": [
        245,
        92,
        17,
        147,
        253,
        88,
        22,
        176
      ],
      "accounts": [
        {
          "name": "likeAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "thread",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "thread.title [.. thread.title_length as usize]",
                "account": "thread"
              },
              {
                "kind": "const",
                "value": [
                  84,
                  72,
                  82,
                  69,
                  65,
                  68,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "thread.thread_author",
                "account": "thread"
              }
            ]
          }
        },
        {
          "name": "like",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  73,
                  75,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "likeAuthority"
              },
              {
                "kind": "account",
                "path": "thread"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "likeType",
          "type": {
            "defined": {
              "name": "likeType"
            }
          }
        }
      ]
    },
    {
      "name": "removeLikeThread",
      "discriminator": [
        175,
        158,
        101,
        181,
        108,
        194,
        60,
        246
      ],
      "accounts": [
        {
          "name": "likeAuthor",
          "writable": true,
          "signer": true
        },
        {
          "name": "thread",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "thread.title [.. thread.title_length as usize]",
                "account": "thread"
              },
              {
                "kind": "const",
                "value": [
                  84,
                  72,
                  82,
                  69,
                  65,
                  68,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "thread.thread_author",
                "account": "thread"
              }
            ]
          }
        },
        {
          "name": "like",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  76,
                  73,
                  75,
                  69,
                  95,
                  83,
                  69,
                  69,
                  68
                ]
              },
              {
                "kind": "account",
                "path": "likeAuthor"
              },
              {
                "kind": "account",
                "path": "thread"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "uncommentThread",
      "discriminator": [
        211,
        135,
        59,
        179,
        50,
        173,
        29,
        31
      ],
      "accounts": [
        {
          "name": "commentAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "comment",
          "writable": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "comment",
      "discriminator": [
        150,
        135,
        96,
        244,
        55,
        199,
        50,
        65
      ]
    },
    {
      "name": "like",
      "discriminator": [
        10,
        133,
        129,
        201,
        87,
        218,
        203,
        222
      ]
    },
    {
      "name": "thread",
      "discriminator": [
        186,
        27,
        154,
        111,
        51,
        36,
        159,
        90
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Cannot initialize, title too long"
    },
    {
      "code": 6001,
      "name": "contentTooLong",
      "msg": "Cannot initialize, content too long"
    },
    {
      "code": 6002,
      "name": "tagTooMany",
      "msg": "Cannot initialize, too many tag"
    },
    {
      "code": 6003,
      "name": "tagTooLong",
      "msg": "Cannot initialize, tag too long"
    },
    {
      "code": 6004,
      "name": "commentContentTooLong",
      "msg": "Cannot create comment, comment content too long"
    },
    {
      "code": 6005,
      "name": "maxLikeReached",
      "msg": "Cannot like, Max like reached"
    },
    {
      "code": 6006,
      "name": "maxDislikesReached",
      "msg": "Cannot dislike, Max dislikes reached"
    }
  ],
  "types": [
    {
      "name": "comment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "discriminator",
            "type": "u8"
          },
          {
            "name": "commentAuthor",
            "type": "pubkey"
          },
          {
            "name": "parent",
            "type": "pubkey"
          },
          {
            "name": "comment",
            "type": {
              "array": [
                "u8",
                200
              ]
            }
          },
          {
            "name": "commentLength",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "like",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "discriminator",
            "type": "u8"
          },
          {
            "name": "likeAuthor",
            "type": "pubkey"
          },
          {
            "name": "parent",
            "type": "pubkey"
          },
          {
            "name": "reaction",
            "type": {
              "defined": {
                "name": "likeType"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "likeType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "like"
          },
          {
            "name": "celebrate"
          },
          {
            "name": "insightful"
          },
          {
            "name": "love"
          },
          {
            "name": "curious"
          },
          {
            "name": "support"
          },
          {
            "name": "funny"
          }
        ]
      }
    },
    {
      "name": "thread",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "discriminator",
            "type": "u8"
          },
          {
            "name": "threadAuthor",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "titleLength",
            "type": "u8"
          },
          {
            "name": "content",
            "type": {
              "array": [
                "u8",
                500
              ]
            }
          },
          {
            "name": "tags",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    10
                  ]
                },
                10
              ]
            }
          },
          {
            "name": "likes",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
