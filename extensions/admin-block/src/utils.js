export async function getMetafields(productId) {
  return await makeGraphQLQuery(
    `query Product($id: ID!) {
      product(id: $id) {
        metafield(namespace: "data", key: "package_replacements") {
          value
        }
      }
    }`,
    { id: productId }
  );
}

export async function updateMetafields(productId, metafieldData) {
  return await makeGraphQLQuery(
    `mutation SetMetafield($ownerId: ID!, $namespace: String!, $key: String!, $value: String!) {
      metafieldsSet(metafields: [{ownerId:$ownerId, namespace:$namespace, key:$key, type:"single_line_text_field", value:$value}]) {
        userErrors {
          field
          message
          code
        }
      }
    }`,
    {
      ownerId: productId,
      namespace: "data",
      key: "package_replacements",
      value: JSON.stringify(metafieldData),
    }
  );
}

async function makeGraphQLQuery(query, variables) {
  const graphQLQuery = {
    query,
    variables,
  };

  const res = await fetch("shopify:admin/api/graphql.json", {
    method: "POST",
    body: JSON.stringify(graphQLQuery),
  });

  if (!res.ok) {
    console.error("Network error");
  }

  return await res.json();
}
