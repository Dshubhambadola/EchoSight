FROM golang:1.24-alpine

WORKDIR /app

# Initialize module if it doesn't exist (handle locally, but ensuring it here for build)
# In a real scenario we copy go.mod/sum first. 
# Since I'm not sure if go.mod exists yet, I'll copy everything and run init if needed in a script or just assume main.go is standalone for now?
# Let's assume standard Go setup.

COPY . .

# If go.mod doesn't exist, init it.
RUN if [ ! -f go.mod ]; then go mod init collector && go mod tidy; fi
# If go.mod exists, tidy it.
RUN if [ -f go.mod ]; then go mod tidy; fi

RUN go build -o collector main.go

CMD ["./collector"]
