FROM node:14-alpine as builder

WORKDIR /code

# 先将依赖目录转入到code目录
ADD package.json package-lock.json /code/
# 如果没有变化 yarn不会再次下载依赖
RUN yarn

# 再将src下更新的代码cope到code目录下
ADD . /code
RUN yarn && npm run build # 打包

CMD npx serve -s build

FROM nginx:alpine

COPY --from=builder code/build /usr/share/nginx/html