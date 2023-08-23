FROM codercom/code-server:latest

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &&\
sudo apt-get install -y nodejs

COPY --chown=coder package.json .
RUN npm i

COPY --chown=coder . .
RUN cd packages/vscode-scripts && npm i

RUN npm run package
RUN code-server --install-extension packages/vscode-scripts/vscode-starter-1.0.0.vsix

CMD ["/source", "--auth", "none", "--disable-telemetry", "--disable-workspace-trust"]