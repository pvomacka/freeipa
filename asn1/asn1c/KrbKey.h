/*
 * Generated by asn1c-0.9.21 (http://lionet.info/asn1c)
 * From ASN.1 module "KeytabModule"
 * 	found in "ipa.asn1"
 * 	`asn1c -fskeletons-copy`
 */

#ifndef	_KrbKey_H_
#define	_KrbKey_H_


#include <asn_application.h>

/* Including external dependencies */
#include "TypeValuePair.h"
#include <OCTET_STRING.h>
#include <constr_SEQUENCE.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Forward declarations */
struct TypeValuePair;

/* KrbKey */
typedef struct KrbKey {
	TypeValuePair_t	 key;
	struct TypeValuePair	*salt	/* OPTIONAL */;
	OCTET_STRING_t	*s2kparams	/* OPTIONAL */;
	
	/* Context for parsing across buffer boundaries */
	asn_struct_ctx_t _asn_ctx;
} KrbKey_t;

/* Implementation */
extern asn_TYPE_descriptor_t asn_DEF_KrbKey;

#ifdef __cplusplus
}
#endif

/* Referred external types */
#include "TypeValuePair.h"

#endif	/* _KrbKey_H_ */
