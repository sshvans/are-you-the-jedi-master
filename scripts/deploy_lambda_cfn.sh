#! /bin/bash

# Command to run from project root
# bash scripts/deploy_lambda_cfn.sh <region> <key-name> <lambda-bucket-name> <stack-name> e.g.
# bash scripts/deploy_lambda_cfn.sh us-west-2 cikey ddr-code-2 jedi-stack

REGION=$1
KEY_NAME=$2
DDR_ASSETS_BUCKET=$3
STACK_NAME=$4

aws s3 mb s3://${DDR_ASSETS_BUCKET} --region ${REGION}

RESULT=$?

if [ ${RESULT} -eq 0 ]; then
  echo "Successfully created bucket"
else
  echo "Failed to create bucket, provide a new name and retry"
  exit 1
fi

cd lambdas
for file in *.py;
do
    filePart="${file%.*}"
    echo ${filePart}
    zip ${filePart}.zip ${filePart}.py
    aws s3 cp ${filePart}.zip s3://${DDR_ASSETS_BUCKET}/assets/ --region ${REGION}
done

echo "Successfully deployed lambda functions"

cd ..

aws s3 cp cfn/jedi-api.json s3://${DDR_ASSETS_BUCKET}/templates/

REGION_DEFAULT_VPC=$(aws ec2 describe-vpcs --region $REGION | jq '.[]|.[]|select(.IsDefault == true)|.VpcId' | tr -d '"')

sed -i '' "s/KEYNAME_TOKEN/${KEY_NAME}/g" cfn/jedi-params.json
sed -i '' "s/VPC_TOKEN/${REGION_DEFAULT_VPC}/g" cfn/jedi-params.json
sed -i '' "s/BUCKET_TOKEN/${DDR_ASSETS_BUCKET}/g" cfn/jedi-params.json

echo "Replaced tokens in cloudformation parameters file"

aws cloudformation --region ${REGION} create-stack --stack-name $4 \
  --template-url https://${DDR_ASSETS_BUCKET}.s3.amazonaws.com/templates/jedi-api.json \
  --parameters file://cfn/jedi-params.json \
  --capabilities "CAPABILITY_IAM"

echo "Successfully launched stack"